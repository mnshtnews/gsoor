using System.Text.Json;
using Jusoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Jusoor.Infrastructure.Persistence;

/// <summary>
/// Idempotently installs the curated country and major-city catalog. Existing
/// editorially maintained names are preserved; only missing coordinates are filled.
/// </summary>
public static class GeographyCatalogSeeder
{
    private const string ResourceName = "Jusoor.Infrastructure.Persistence.Data.geography-catalog.json";
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        await using var stream = typeof(GeographyCatalogSeeder).Assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Embedded geography catalog '{ResourceName}' was not found.");
        var records = await JsonSerializer.DeserializeAsync<CountrySeed[]>(stream, JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The embedded geography catalog is empty or invalid.");

        var countries = await db.Countries.ToDictionaryAsync(country => country.IsoCode2, StringComparer.OrdinalIgnoreCase, cancellationToken);
        var changed = false;
        foreach (var record in records)
        {
            if (!countries.TryGetValue(record.IsoCode2, out var country))
            {
                country = new Country
                {
                    NameAr = record.NameAr,
                    NameEn = record.NameEn,
                    IsoCode2 = record.IsoCode2,
                    Slug = record.Slug,
                    Latitude = record.Latitude,
                    Longitude = record.Longitude
                };
                db.Countries.Add(country);
                countries.Add(record.IsoCode2, country);
                changed = true;
                continue;
            }

            if (country.Latitude is null) { country.Latitude = record.Latitude; changed = true; }
            if (country.Longitude is null) { country.Longitude = record.Longitude; changed = true; }
        }

        if (changed)
            await db.SaveChangesAsync(cancellationToken);

        var countryIds = countries.Values.Select(country => country.Id).ToArray();
        var cities = await db.Cities
            .Where(city => countryIds.Contains(city.CountryId))
            .ToDictionaryAsync(city => (city.CountryId, city.Slug), cancellationToken);
        foreach (var record in records)
        {
            var country = countries[record.IsoCode2];
            foreach (var citySeed in record.Cities)
            {
                if (!cities.TryGetValue((country.Id, citySeed.Slug), out var city))
                {
                    city = new City
                    {
                        CountryId = country.Id,
                        NameAr = citySeed.NameAr,
                        NameEn = citySeed.NameEn,
                        Slug = citySeed.Slug,
                        Latitude = citySeed.Latitude,
                        Longitude = citySeed.Longitude
                    };
                    db.Cities.Add(city);
                    cities.Add((country.Id, citySeed.Slug), city);
                    changed = true;
                    continue;
                }

                if (city.Latitude is null) { city.Latitude = citySeed.Latitude; changed = true; }
                if (city.Longitude is null) { city.Longitude = citySeed.Longitude; changed = true; }
            }
        }

        if (changed)
            await db.SaveChangesAsync(cancellationToken);
    }

    private sealed record CountrySeed(string IsoCode2, string NameAr, string NameEn, string Slug, decimal Latitude, decimal Longitude, CitySeed[] Cities);
    private sealed record CitySeed(string NameAr, string NameEn, string Slug, decimal Latitude, decimal Longitude, long Population, long GeonamesId);
}

