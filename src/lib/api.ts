// API utilities for fetching Wordle data
const API_BASE_URL = 'https://api.wordauditor.com';

// Fetch today's Wordle answer directly from API
export async function getTodayWordle() {
  const response = await fetch(`${API_BASE_URL}/api/today`);
  if (!response.ok) {
    throw new Error('Failed to fetch today\'s Wordle answer');
  }
  return response.json();
}

// Fetch Wordle answer by ID
export async function getWordleById(id: number) {
  const response = await fetch(`${API_BASE_URL}/api/answer/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Wordle answer');
  }
  return response.json();
}

// Fetch Wordle answer by date
export async function getWordleByDate(date: string) {
  const response = await fetch(`${API_BASE_URL}/api/date/${date}`);
  if (!response.ok) {
    throw new Error('Failed to fetch Wordle answer');
  }
  return response.json();
}

// Fetch latest Wordle answers
export async function getLatestWordles(count: number = 10) {
  const response = await fetch(`${API_BASE_URL}/api/latest/${count}`);
  if (!response.ok) {
    throw new Error('Failed to fetch latest Wordle answers');
  }
  const data = await response.json();

  // Check if the response has a results property (API returns {results: [...]} format)
  // Otherwise, return the data as is (assuming it's already the array we need)
  return data.results ? data.results : (Array.isArray(data) ? data : []);
}

// Search Wordle answers
export async function searchWordles(query: string) {
  const response = await fetch(`${API_BASE_URL}/api/search/${query}`);
  if (!response.ok) {
    throw new Error('Failed to search Wordle answers');
  }
  return response.json();
}

// Get a random Wordle answer
export async function getRandomWordle() {
  const response = await fetch(`${API_BASE_URL}/api/random`);
  if (!response.ok) {
    throw new Error('Failed to fetch random Wordle answer');
  }
  return response.json();
}

// Type for Wordle answer data
export interface WordleAnswer {
  id: number;
  date: string;
  solution: string;
  days_since_launch?: number;
  editor?: string;
  content_guide?: string;
  social_image?: string;
  social_image_direct?: string;
  youtube_video_url?: string;
}
