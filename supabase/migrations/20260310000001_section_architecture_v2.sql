-- Section Architecture v2 (2026-03-10)
-- Replaces original 8 sections with new 12-section architecture per REF: Section Architecture

-- Add featured column to distinguish top-nav sections from "More" dropdown
alter table sections add column if not exists featured boolean not null default false;

-- Remove articles linked to deprecated sections
delete from articles where section_id in (
  select id from sections where slug in (
    'vampire-affairs', 'undead-health', 'demon-politics', 'werewolf-rights',
    'spirit-world', 'weather-omens'
  )
);

-- Remove deprecated sections
delete from sections where slug in (
  'vampire-affairs', 'undead-health', 'demon-politics', 'werewolf-rights',
  'spirit-world', 'weather-omens'
);

-- Update retained sections (occult-markets and opinion kept with same slug)
update sections set
  description = 'Soul futures, grimoire tech, enchanted real estate, arcane finance, IPOs, and dark exchange trading.',
  sort_order = 3,
  featured = true
where slug = 'occult-markets';

update sections set
  description = 'Op-eds from notable undead voices, columnist format, letters to the editor.',
  sort_order = 7,
  featured = true
where slug = 'opinion';

-- Insert new sections
insert into sections (name, slug, description, tag_color, sort_order, featured) values
  ('Underworld Affairs', 'underworld-affairs', 'Governance, council proceedings, inter-realm diplomacy, legislation, and sovereignty disputes.', '#8b1a1a', 1, true),
  ('Ether & Veil', 'ether-and-veil', 'Hauntings, spectral regulation, ley lines, veil integrity, and ethereal spectrum coverage.', '#5a5a8b', 2, true),
  ('Creature Profile', 'creature-profile', 'Long-form profiles of notable supernatural figures. One subject, deep.', '#4a4a4a', 4, true),
  ('Ask Astra', 'ask-astra', 'Advice column. Readers write in, Astra answers in the UNN editorial voice.', '#6b2fa0', 5, true),
  ('Weather & Omens', 'weather-and-omens', 'Wail indices, blood moon forecasts, omen readings, and spectral weather patterns.', '#4a7c59', 6, true),
  ('Human Affairs Desk', 'human-affairs', 'Monitoring the mortal world — policy, science, and demographics affecting supernatural stakeholders.', '#8b6914', 8, false),
  ('Labor Desk', 'labor', 'Union activity, civil rights, workplace accommodation, NLRB grievances, and coexistence law.', '#4a4a4a', 9, false),
  ('Health Desk', 'health', 'Nutrition, decomposition, reanimation science, blood supply, and public health advisories.', '#4a7c59', 10, false),
  ('Cultural & Entertainment Desk', 'culture', 'Arts, media, nightlife, festivals, film, theater, and book reviews.', '#6b2fa0', 11, false),
  ('The Crypt Desk', 'the-crypt', 'Archives, investigations, long-form historical reporting, and deep records.', '#5a5a8b', 12, false);
