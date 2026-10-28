using System.ComponentModel.DataAnnotations;
using Jusoor.Application.Auth;
using Jusoor.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Jusoor.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
[EnableRateLimiting("email-otp")]
public sealed class AuthController(IEmailOtpAuthService auth, ISender mediator) : ControllerBase
{
    public sealed record RegisterRequest([Required, EmailAddress, MaxLength(256)] string Email, [Required, MinLength(8), MaxLength(128)] string Password, [Required, MaxLength(100)] string DisplayName);
    public sealed record LoginRequest([Required, EmailAddress, MaxLength(256)] string Email, [Required, MaxLength(128)] string Password);
    public sealed record VerifyRequest([Required, EmailAddress, MaxLength(256)] string Email, [Required, StringLength(6, MinimumLength = 6)] string Code);
    public sealed record ResendRequest([Required, EmailAddress, MaxLength(256)] string Email, [Required, MaxLength(128)] string Password, [Required] string Purpose);

    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> Register(RegisterRequest request, CancellationToken ct)
        => StartResponse(await auth.RegisterAsync(request.Email, request.Password, request.DisplayName, ct), request.Email);

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new LoginCommand(request.Email, request.Password), ct);
        return result.Succeeded && result.Tokens is not null
            ? Ok(result.Tokens)
            : Unauthorized(new { message = "تعذّر تسجيل الدخول. راجع البريد وكلمة المرور وحاول مجددًا." });
    }

    [HttpPost("resend")]
    public async Task<IActionResult> Resend(ResendRequest request, CancellationToken ct)
        => StartResponse(await auth.ResendAsync(request.Email, request.Password, request.Purpose, ct), request.Email);

    [HttpPost("verify")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Verify(VerifyRequest request, CancellationToken ct)
    {
        var result = await auth.VerifyAsync(request.Email, request.Code, ct);
        return result.Outcome switch
        {
            EmailOtpCompletionOutcome.Succeeded => Ok(result.Tokens),
            EmailOtpCompletionOutcome.NotConfigured => StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "خدمة التحقق بالبريد غير مهيأة بعد." }),
            EmailOtpCompletionOutcome.RateLimited => StatusCode(StatusCodes.Status429TooManyRequests, new { message = "محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة." }),
            _ => BadRequest(new { message = "رمز التحقق غير صحيح أو انتهت صلاحيته." })
        };
    }

    private IActionResult StartResponse(EmailOtpStartResult result, string email) => result.Outcome switch
    {
        EmailOtpStartOutcome.Accepted => Accepted(new { requiresEmailOtp = true, email, message = "أرسلنا رمز تحقق إلى بريدك الإلكتروني." }),
        EmailOtpStartOutcome.NotConfigured => StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "تسجيل الدخول برمز البريد غير مهيأ بعد. أكمل إعداد خدمة البريد أولًا." }),
        EmailOtpStartOutcome.RateLimited => StatusCode(StatusCodes.Status429TooManyRequests, new { message = "أرسلنا رمزًا مؤخرًا. انتظر دقيقة قبل طلب رمز جديد." }),
        EmailOtpStartOutcome.DeliveryUnavailable => StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "تعذّر إرسال رمز التحقق. انتظر دقيقة ثم أعد المحاولة." }),
        EmailOtpStartOutcome.EmailAlreadyRegistered => Conflict(new { message = "تعذّر إنشاء الحساب بهذا البريد. سجّل الدخول أو استخدم بريدًا آخر." }),
        _ => Unauthorized(new { message = "تعذّر التحقق من البيانات. راجع البريد وكلمة المرور وحاول مجددًا." })
    };
}
