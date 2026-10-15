const endpoint = "/api/highscores";

async function request(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Leaderboard request failed (${response.status}).`);
  }
  return response.json();
}

export function getHighScores() {
  return request(endpoint);
}

export function submitHighScore({ name, score, difficulty }) {
  return request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score, difficulty }),
  });
}
