using Hangfire;
using Hangfire.PostgreSql;
using Jusoor.Api.Middleware;
using Jusoor.Application;
using Jusoor.Infrastructure;
using Jusoor.Infrastructure.Identity;
using Jusoor.Infrastructure.Ingestion;
using Jusoor.Infrastructure.Persistence;
using Jusoor.Infrastructure.Scheduling;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
var clientDemoMode = builder.Configuration.GetValue<bool>("ClientDemoMode");
var useVpsFieldEncryption = builder.Configuration.GetValue<bool>("UseVpsFieldEncryption");
var keyRingPath = builder.Configuration["FieldEncryption:KeyRingFile"];
if (useVpsFieldEncryption && builder.Configuration.GetValue<bool>("UseLocalFieldEncryption"))
    throw new InvalidOperationException("UseVpsFieldEncryption and UseLocalFieldEncryption cannot both be enabled.");

// Local field encryption is only allowed for Development or the explicitly
// isolated Staging client demo. Production may use Azure Key Vault or the
// explicit VPS file-backed envelope provider; local OTP is never allowed.
if (!builder.Environment.IsDevelopment())
{
    if (clientDemoMode)
    {
        if (!builder.Environment.IsStaging())
            throw new InvalidOperationException("ClientDemoMode is allowed only with ASPNETCORE_ENVIRONMENT=Staging.");
        if (!builder.Configuration.GetValue<bool>("UseLocalFieldEncryption") ||
            builder.Configuration.GetValue<bool>("UseLocalOtp"))
            throw new InvalidOperationException("ClientDemoMode requires local field encryption and the disabled demo OTP provider.");
        if (string.IsNullOrWhiteSpace(builder.Configuration["FieldEncryption:LocalKey"]) &&
            !File.Exists(keyRingPath))
            throw new InvalidOperationException("ClientDemoMode requires a stable local key or mounted field-encryption key ring.");
    }
    else
    {
        if (builder.Configuration.GetValue<bool>("UseLocalFieldEncryption") ||
            builder.Configuration.GetValue<bool>("UseLocalOtp"))
        {
            throw new InvalidOperationException(
                "Development-only encryption and OTP providers cannot be used in Production.");
        }

        var missingProductionSettings = new List<string>();
        foreach (var key in new[] { "Twilio:AccountSid", "Twilio:AuthToken", "Twilio:VerifyServiceSid" })
        {
            if (string.IsNullOrWhiteSpace(builder.Configuration[key]))
                missingProductionSettings.Add(key);
        }

        if (useVpsFieldEncryption)
        {
            if (string.IsNullOrWhiteSpace(keyRingPath) || !File.Exists(keyRingPath))
                missingProductionSettings.Add("FieldEncryption:KeyRingFile (mounted Docker secret)");
        }
        else
        {
            foreach (var key in new[] { "FieldEncryption:KeyVaultUri", "FieldEncryption:KeyEncryptionKeyName" })
            {
                if (string.IsNullOrWhiteSpace(builder.Configuration[key]))
                    missingProductionSettings.Add(key);
            }
        }

        if (missingProductionSettings.Count > 0)
        {
            throw new InvalidOperationException(
                $"Production security configuration is incomplete: {string.Join(", ", missingProductionSettings)}.");
        }
    }
}
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

builder.Services.AddApplication(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<Jusoor.Api.Services.EditorialTranslationGenerator>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS is intentionally narrow: only the Next.js origin(s) from config are
// allowed, never AllowAnyOrigin — the API will eventually carry Atmaen data.
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

if (clientDemoMode)
{
    app.Logger.LogWarning(
        "CLIENT DEMO MODE ENABLED: use only a dedicated disposable preview database and synthetic content. Atmaen OTP verification is disabled; never store real applicant data here.");
}

// Hangfire storage is configured after Build() only when background jobs are
// enabled. This keeps the free preview database idle between user requests.
var backgroundJobsEnabled = app.Configuration.GetValue("BackgroundJobs:Enabled", true);
if (backgroundJobsEnabled)
{
    var hangfireConnectionString = app.Configuration.GetConnectionString("Postgres")
        ?? throw new InvalidOperationException("ConnectionStrings:Postgres is missing (required for Hangfire storage).");
    GlobalConfiguration.Configuration.UsePostgreSqlStorage(options => options.UseNpgsqlConnection(hangfireConnectionString));
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();

// Auto-migrate + seed roles on boot. Always in Development, so `docker compose up`
// satisfies the Phase 0 DoD ("new dev running locally in under an hour") without
// a manual migration step. Staging/production apply migrations explicitly during
// deploy (CI/CD job), never automatically on boot — EXCEPT a hosted trial
// environment that has no separate deploy job and explicitly opts in with
// Bootstrap__RunOnStartup=true. Swagger stays Development-only.
if (app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("Bootstrap:RunOnStartup"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await RoleSeeder.SeedAsync(roleManager);

    // Optional newsroom logins, driven purely by DevSeed:* configuration (no-op when
    // unset). Used for local dev and for the client-trial environment's accounts.
    await DevelopmentNewsroomSeeder.SeedAsync(
        scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>(),
        app.Configuration,
        scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("DevelopmentNewsroomSeeder"));
}

// Reference geography is application data, so it is installed idempotently after schema migrations.
using (var geographyScope = app.Services.CreateScope())
{
    var db = geographyScope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await GeographyCatalogSeeder.SeedAsync(db);
}

// A TLS-terminating reverse proxy (for example Caddy on the VPS) forwards
// requests to this container over HTTP. Disable in-container redirects there
// to avoid a proxy redirect loop; local deployments keep the default behavior.
if (app.Configuration.GetValue("HttpsRedirection:Enabled", true))
    app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// The dashboard has no browser-compatible authenticated admin session yet.
// Keep it entirely out of Staging/Production rather than treating the
// default local-only filter as deployed access control. Background jobs run
// normally without exposing this operational UI.
if (app.Environment.IsDevelopment() && app.Configuration.GetValue("Hangfire:DashboardEnabled", true))
{
    app.MapHangfireDashboard("/hangfire");
}

using (var scope = app.Services.CreateScope())
{
    var ingestionOptions = scope.ServiceProvider.GetRequiredService<IOptions<IngestionOptions>>().Value;
    var cronExpression = $"*/{ingestionOptions.ScheduleIntervalMinutes} * * * *";

    if (backgroundJobsEnabled)
    {
        RecurringJob.AddOrUpdate<SourceIngestionSweepJob>(
            "source-ingestion-sweep",
            job => job.RunAsync(JobCancellationToken.Null),
            cronExpression);

        // Slice 24: the schedule timestamp on each approved article is durable in
        // PostgreSQL. A one-minute sweep makes retries and process restarts safe;
        // the worker performs an idempotent status-checked transition plus audit.
        RecurringJob.AddOrUpdate<ScheduledEditorialPublicationJob>(
            ScheduledEditorialPublicationJob.JobId,
            job => job.RunAsync(JobCancellationToken.Null),
            Cron.Minutely());
    }
}

app.Run();

// Exposed for WebApplicationFactory-based integration tests.
public partial class Program { }
