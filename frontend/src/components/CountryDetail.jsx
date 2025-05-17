import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/NavBar";
import Footer from "../components/Footer";

const CountryDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const country = state?.country;
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  if (!country) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Country not found
            </h3>
            <p className="mt-1 text-gray-500">
              The country you're looking for doesn't exist or the data is
              unavailable.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Generate OpenStreetMap URL based on country coordinates
  const openStreetMapUrl = country.latlng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        country.latlng[1] - 5
      }%2C${country.latlng[0] - 5}%2C${country.latlng[1] + 5}%2C${
        country.latlng[0] + 5
      }&layer=mapnik`
    : `https://www.openstreetmap.org/export/embed.html?q=${encodeURIComponent(
        country.name.common
      )}&layer=mapnik`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Combined Back Button and Main Card */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Back Button - Now positioned to the left on large screens */}
            <button
              onClick={() => navigate(-1)}
              className="lg:sticky lg:top-8 flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition shadow-sm w-full lg:w-auto"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="lg:hidden">Back</span>
            </button>

            {/* Main Card - Takes remaining space */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex-1">
              {/* Header with Flag and Name */}
              <div className="bg-indigo-600 p-6 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{country.name.common}</h1>
                  <p className="text-indigo-100">{country.name.official}</p>
                </div>
                <div className="w-16 h-12 bg-white rounded shadow-md overflow-hidden">
                  <img
                    src={country.flags.svg}
                    alt={`${country.name.common} flag`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Visual Elements */}
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={country.flags.svg}
                      alt={`${country.name.common} flag`}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {country.coatOfArms?.svg && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        Coat of Arms
                      </h3>
                      <div className="flex justify-center">
                        <img
                          src={country.coatOfArms.svg}
                          alt={`${country.name.common} coat of arms`}
                          className="h-24 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Capital</p>
                        <p className="font-medium text-sm">
                          {country.capital?.[0] || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Region</p>
                        <p className="font-medium text-sm">
                          {country.region}{" "}
                          {country.subregion && `(${country.subregion})`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Population</p>
                        <p className="font-medium text-sm">
                          {country.population.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Area</p>
                        <p className="font-medium text-sm">
                          {country.area?.toLocaleString() || "N/A"} km²
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Languages & Currencies */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        Languages
                      </h3>
                      {country.languages ? (
                        <ul className="space-y-1">
                          {Object.values(country.languages).map(
                            (language, index) => (
                              <li
                                key={index}
                                className="text-sm flex items-center"
                              >
                                <span className="w-1.5 h-1.5 mr-2 bg-indigo-500 rounded-full"></span>
                                {language}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm">N/A</p>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="text-md font-semibold text-gray-800 mb-2">
                        Currencies
                      </h3>
                      {country.currencies ? (
                        <ul className="space-y-1">
                          {Object.values(country.currencies).map(
                            (currency, index) => (
                              <li key={index} className="text-sm">
                                <span className="w-1.5 h-1.5 mr-2 bg-indigo-500 rounded-full inline-block"></span>
                                {currency.name}{" "}
                                {currency.symbol && `(${currency.symbol})`}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm">N/A</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">
                      Additional Info
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Timezones</p>
                        <p className="font-medium text-sm">
                          {country.timezones?.slice(0, 2).join(", ")}
                          {country.timezones?.length > 2 && "..."}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Calling Code</p>
                        <p className="font-medium text-sm">
                          {country.idd?.root && country.idd?.suffixes?.[0]
                            ? `${country.idd.root}${country.idd.suffixes[0]}`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">TLD</p>
                        <p className="font-medium text-sm">
                          {country.tld?.[0] || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Driving Side</p>
                        <p className="font-medium text-sm capitalize">
                          {country.car?.side || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* OpenStreetMap Button */}
                  <button
                    onClick={() => setIsMapModalOpen(true)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm text-center"
                  >
                    View on OpenStreetMap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* OpenStreetMap Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Map of {country.name.common}
              </h3>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-grow">
              <iframe
                src={openStreetMapUrl}
                title={`${country.name.common} on OpenStreetMap`}
                className="w-full h-full min-h-[400px]"
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
              <a
                href={`https://www.openstreetmap.org/?mlat=${
                  country.latlng?.[0] || ""
                }&mlon=${country.latlng?.[1] || ""}#map=5/${
                  country.latlng?.[0] || ""
                }/${country.latlng?.[1] || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-md hover:bg-indigo-50 transition-all shadow-sm border border-gray-200 hover:border-indigo-200 hover:shadow-md text-sm font-medium"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CountryDetail;
