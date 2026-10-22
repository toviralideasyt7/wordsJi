import countriesData from '$lib/data/worldle/countries.json';
import citiesData from '$lib/data/worldle/cities.json';
import countryDetailsData from '$lib/data/worldle/country-details.json';
import { WORLDLE_START_DATE, getCurrentWorldleDateString, getDailyWorldleAnswer, isValidWorldleDate } from '$lib/worldle/logic';
import { getWorldleDbCountryCode } from '$lib/server/daily-games-answers';
import type { WorldleCity, WorldleCountry, WorldleCountryDetailsMap } from '$lib/worldle/types';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const countries = countriesData as WorldleCountry[];
const cities = citiesData as WorldleCity[];
const countryDetails = countryDetailsData as WorldleCountryDetailsMap;

export const GET: RequestHandler = async ({ url }) => {
  const date = url.searchParams.get('date');
  const todayDate = getCurrentWorldleDateString();

  if (!date || !isValidWorldleDate(date, todayDate)) {
    return json(
      {
        error: `Date must be between ${WORLDLE_START_DATE} and ${todayDate}.`,
      },
      { status: 400 },
    );
  }

  const dbCode = await getWorldleDbCountryCode(date);
  const answer = getDailyWorldleAnswer(
    countries,
    cities,
    countryDetails,
    date,
    dbCode ? { [date]: dbCode } : undefined,
  );
  return json({ answer });
};
