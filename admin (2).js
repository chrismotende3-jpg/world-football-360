import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

const r = Router();
const str = (v, max = 20000) => String(v ?? '').trim().slice(0, max);
const audit = async (q, action, entity, entityId, metadata = {}) => {
  try {
    await q.auth.client.from('admin_audit_logs').insert({
      admin_id: q.auth.user.id,
      action,
      entity_type: entity,
      entity_id: entityId || null,
      metadata
    });
  } catch { /* audit logging must not break the primary operation */ }
};

r.get('/users', requireAdmin, async (q, s, n) => {
  try {
    const { data, error } = await q.auth.client.from('profiles')
      .select('id,username,role,is_online,updated_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    s.json({ users: data || [] });
  } catch (e) { n(e); }
});

r.post('/news', requireAdmin, async (q, s, n) => {
  try {
    const title = str(q.body.title, 180);
    const body = str(q.body.body, 50000);
    if (!title || !body) return s.status(400).json({ error: 'title and body are required' });
    const { data, error } = await q.auth.client.from('news').insert({
      title, body, published: Boolean(q.body.published), author_id: q.auth.user.id
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'news', data?.id, { title: data?.title });
    s.json({ news: data });
  } catch (e) { n(e); }
});

r.delete('/news/:id', requireAdmin, async (q, s, n) => {
  try {
    const { error } = await q.auth.client.from('news').delete().eq('id', q.params.id);
    if (error) throw error;
    await audit(q, 'delete', 'news', q.params.id);
    s.json({ ok: true });
  } catch (e) { n(e); }
});

r.post('/polls', requireAdmin, async (q, s, n) => {
  try {
    const question = str(q.body.question, 500);
    const options = Array.isArray(q.body.options) ? q.body.options.map(x => str(x, 200)).filter(Boolean) : [];
    if (!question || options.length < 2) return s.status(400).json({ error: 'question and at least two options are required' });
    const { data, error } = await q.auth.client.from('polls').insert({
      question, options, active: q.body.active !== false, created_by: q.auth.user.id
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'polls', data?.id, { question: data?.question });
    s.json({ poll: data });
  } catch (e) { n(e); }
});

r.post('/quizzes', requireAdmin, async (q, s, n) => {
  try {
    const question = str(q.body.question, 1000);
    const options = Array.isArray(q.body.options) ? q.body.options.map(x => str(x, 300)).filter(Boolean) : [];
    const correct_answer = str(q.body.correct_answer, 300);
    if (!question || options.length < 2 || !correct_answer || !options.some(x => x.toLowerCase() === correct_answer.toLowerCase())) {
      return s.status(400).json({ error: 'question, at least two options, and a matching correct answer are required' });
    }
    const { data, error } = await q.auth.client.from('quizzes').insert({
      question, options, correct_answer, published: Boolean(q.body.published), created_by: q.auth.user.id
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'quizzes', data?.id, { question: data?.question });
    s.json({ quiz: data });
  } catch (e) { n(e); }
});

r.post('/media', requireAdmin, async (q, s, n) => {
  try {
    const title = str(q.body.title, 180);
    const rawUrl = str(q.body.url, 2000);
    if (!title || !rawUrl) return s.status(400).json({ error: 'title and url are required' });
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:') return s.status(400).json({ error: 'Media URLs must use HTTPS' });
    const host = u.hostname.toLowerCase();
    const provider = host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com') ||
      host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com') ? 'youtube' :
      host === 'vimeo.com' || host.endsWith('.vimeo.com') ? 'vimeo' : null;
    if (!provider) return s.status(400).json({ error: 'Only approved YouTube or Vimeo video URLs can be published' });
    const { data, error } = await q.auth.client.from('media').insert({
      title, url: rawUrl, provider, authorized: Boolean(q.body.authorized), created_by: q.auth.user.id
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'media', data?.id, { provider: data?.provider });
    s.json({ media: data });
  } catch (e) { n(e); }
});

r.post('/competitions', requireAdmin, async (q, s, n) => {
  try {
    const name = str(q.body.name, 160);
    if (!name) return s.status(400).json({ error: 'name is required' });
    const { data, error } = await q.auth.client.from('competitions').insert({
      api_league_id: Number.isInteger(Number(q.body.api_league_id)) ? Number(q.body.api_league_id) : null,
      name, country: str(q.body.country, 120) || null, logo_url: str(q.body.logo_url, 1000) || null,
      season: Number.isInteger(Number(q.body.season)) ? Number(q.body.season) : null,
      active: q.body.active !== false
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'competitions', data?.id, { name });
    s.json({ competition: data });
  } catch (e) { n(e); }
});

r.post('/teams', requireAdmin, async (q, s, n) => {
  try {
    const api_team_id = Number(q.body.api_team_id), name = str(q.body.name, 160);
    if (!Number.isInteger(api_team_id) || !name) return s.status(400).json({ error: 'valid api_team_id and name are required' });
    const { data, error } = await q.auth.client.from('teams').insert({
      api_team_id, competition_id: q.body.competition_id || null, name,
      short_name: str(q.body.short_name, 80) || null, logo_url: str(q.body.logo_url, 1000) || null,
      country: str(q.body.country, 120) || null, venue: str(q.body.venue, 200) || null
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'teams', data?.id, { api_team_id });
    s.json({ team: data });
  } catch (e) { n(e); }
});

r.post('/players', requireAdmin, async (q, s, n) => {
  try {
    const api_player_id = Number(q.body.api_player_id), name = str(q.body.name, 160);
    if (!Number.isInteger(api_player_id) || !name) return s.status(400).json({ error: 'valid api_player_id and name are required' });
    const team_api_id = Number(q.body.team_api_id);
    const { data, error } = await q.auth.client.from('players').insert({
      api_player_id, name, first_name: str(q.body.first_name, 100) || null,
      last_name: str(q.body.last_name, 100) || null, photo_url: str(q.body.photo_url, 1000) || null,
      nationality: str(q.body.nationality, 120) || null, position: str(q.body.position, 80) || null,
      team_api_id: Number.isInteger(team_api_id) ? team_api_id : null
    }).select().single();
    if (error) throw error;
    await audit(q, 'create', 'players', data?.id, { api_player_id });
    s.json({ player: data });
  } catch (e) { n(e); }
});

r.post('/fixtures', requireAdmin, async (q, s, n) => {
  try {
    const api_fixture_id = Number(q.body.api_fixture_id);
    const home_team_api_id = Number(q.body.home_team_api_id);
    const away_team_api_id = Number(q.body.away_team_api_id);
    if (!Number.isInteger(api_fixture_id) || !Number.isInteger(home_team_api_id) || !Number.isInteger(away_team_api_id)) {
      return s.status(400).json({ error: 'valid api_fixture_id, home_team_api_id and away_team_api_id are required' });
    }
    const row = {
      api_fixture_id, competition_id: q.body.competition_id || null, home_team_api_id, away_team_api_id,
      kickoff_at: q.body.kickoff_at, venue: str(q.body.venue, 200) || null,
      status: str(q.body.status, 60) || 'scheduled',
      home_goals: q.body.home_goals == null ? null : Number(q.body.home_goals),
      away_goals: q.body.away_goals == null ? null : Number(q.body.away_goals)
    };
    if (!row.kickoff_at) return s.status(400).json({ error: 'kickoff_at is required' });
    const { data, error } = await q.auth.client.from('fixtures').insert(row).select().single();
    if (error) throw error;
    await audit(q, 'create', 'fixtures', data?.id, { api_fixture_id: data?.api_fixture_id });
    s.json({ fixture: data });
  } catch (e) { n(e); }
});

export default r;
