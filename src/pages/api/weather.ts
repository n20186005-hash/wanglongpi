import type { APIRoute } from 'astro';
import {createWeatherService} from '../../lib/weather-cache';
export const prerender = false;
const weather=createWeatherService();
export const GET: APIRoute = () => weather();
