// /api/trends/route.ts
import { NextResponse } from 'next/server';

const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const NEWS_API_KEY = process.env.NEWS_API_KEY; // Add your NewsAPI key to .env.local

export async function GET(request: Request) {
  const url = new URL(request.url);
  let topic = url.searchParams.get('topic') || 'industry';
  const country = url.searchParams.get('country') || 'us';

  let apiUrl = `${NEWS_API_URL}?q=${encodeURIComponent(topic)}&country=${country}&apiKey=${NEWS_API_KEY}`;

  try {
    let res = await fetch(apiUrl);
    let data = await res.json();
    // If no articles found, fallback to 'business' topic
    if ((!data.articles || data.articles.length === 0) && topic === 'industry') {
      topic = 'business';
      apiUrl = `${NEWS_API_URL}?q=${encodeURIComponent(topic)}&country=${country}&apiKey=${NEWS_API_KEY}`;
      res = await fetch(apiUrl);
      data = await res.json();
    }
    // If still no articles, return error details
    if (!data.articles || data.articles.length === 0) {
      return NextResponse.json({ error: data.message || 'No news articles found', status: data.status }, { status: 200 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news', details: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error) }, { status: 500 });
  }
}
