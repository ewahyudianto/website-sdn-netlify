// netlify/functions/proxy.js
const fetch = require('node-fetch');

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwGtCKXSm-VlU8Ml-512ErKvhqUDFbgtLz1eLcWrpZrZhrKPsvquVxcTiM0P3XbPDI/exec";

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: 'OK' };
  }

  try {
    let response;

    if (event.httpMethod === 'GET') {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const url_get = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;
      response = await fetch(url_get, { method: 'GET', redirect: 'follow' });

    } else if (event.httpMethod === 'POST') {
      response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: event.body,
        redirect: 'follow'
      });
    }

    if (!response.ok) {
      throw new Error(`Google Script Error: ${response.status}`);
    }

    let text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, raw: text }; // fallback
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
