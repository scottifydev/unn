-- UNN Seed Data
-- Sections, ticker items, council advisory, ad, trending items

-- 8 News Sections
insert into sections (name, slug, description, tag_color, sort_order) values
  ('Vampire Affairs', 'vampire-affairs', 'Vampire Council politics, blood policy, nocturnal governance, and immortal diplomacy.', '#8b1a1a', 1),
  ('Undead Health', 'undead-health', 'Zombie wellness, reanimation science, decomposition management, and afterlife fitness.', '#4a7c59', 2),
  ('Demon Politics', 'demon-politics', 'Infernal governance, hellfire regulation, demonic trade agreements, and Source of All Evil affairs.', '#6b2fa0', 3),
  ('Werewolf Rights', 'werewolf-rights', 'Were-Local 17 labor news, lunar accommodation law, transformation workplace policy.', '#8b6914', 4),
  ('Occult Markets', 'occult-markets', 'Grimoire futures, potion commodities, enchantment IPOs, and dark exchange trading.', '#2a6a8b', 5),
  ('Spirit World', 'spirit-world', 'Spectral affairs, haunting regulations, ethereal real estate, and FCC Ethereal Spectrum Division.', '#5a5a8b', 6),
  ('Opinion', 'opinion', 'Commentary, editorials, and columns from the underworld''s most distinguished voices.', '#666666', 7),
  ('Weather & Omens', 'weather-omens', 'Supernatural forecasts, prophetic indicators, ley line conditions, and veil thickness reports.', '#4a4a4a', 8);

-- 5 Ticker Items
insert into ticker_items (text, priority, active) values
  ('VAMPIRE COUNCIL EXTENDS DAYLIGHT SAVINGS EXEMPTION THROUGH 2027', 3, true),
  ('BREAKING: Source of All Evil files Chapter 11 — restructuring expected to take millennia', 5, true),
  ('Were-Local 17 ratifies new moonlight overtime provisions', 2, true),
  ('FCC Ethereal Spectrum Division issues new bandwidth allocations for spectral communications', 1, true),
  ('Grimoire futures up 3.2% on strong Q4 enchantment demand', 1, true);

-- 1 Council Advisory (Level 2 — Elevated)
insert into council_advisories (level, title, body, active) values
  (2, 'Elevated Advisory: Microplastics Detected in Regional Blood Supply',
   'The Vampire Council has issued an Elevated Advisory following confirmation of microplastic contamination in commercially distributed blood products across the Northeast Corridor. Vampires are advised to source from certified pre-industrial donors until further notice. The Council''s Bureau of Hemoglobin Standards is conducting a full audit of all licensed blood banks.',
   true);

-- 1 Ad (Hexblood Organics)
insert into ads (advertiser, headline, body, tagline, cta_text, cta_url, placement, active) values
  ('Hexblood Organics', 'Your Blood Supply, Perfected.',
   'Premium microplastic-free blood, ethically sourced from verified off-grid donors.',
   'Cold-pressed. Small-batch. Certified pre-industrial.',
   'Shop Now', '#', 'sidebar', true);

-- 5 Trending Items
insert into trending (headline, sort_order, active) values
  ('GLP-1 Drugs Threaten Zombie Food Supply Chain', 1, true),
  ('Microplastics Found in High-End Vampire Blood Products', 2, true),
  ('Source of All Evil Files Chapter 11 Bankruptcy', 3, true),
  ('Were-Local 17 Strikes Over Lunar Accommodation', 4, true),
  ('5G Towers Disrupting Spectral Communications, FCC Investigates', 5, true);
