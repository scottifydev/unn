-- UNN Seed Articles
-- Inserts a staff profile and 6 published articles (one per main section).

-- Create a UNN Staff author profile with a fixed UUID.
-- Uses a raw insert into auth.users first so profiles FK is satisfied.
insert into auth.users (id, email, raw_user_meta_data, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001',
  'staff@underworldnewsnetwork.org',
  '{"display_name": "UNN Staff"}',
  now(), now()
) on conflict (id) do nothing;

insert into profiles (id, display_name, role, bio)
values (
  '00000000-0000-0000-0000-000000000001',
  'UNN Staff',
  'editor',
  'The Underworld News Network editorial desk.'
) on conflict (id) do nothing;


-- Article 1: Undead Health
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  'GLP-1 Weight Loss Drugs Devastate Zombie Food Supply, Industry in Crisis',
  'glp1-zombie-food-crisis',
  'The booming weight-loss drug market has triggered an unprecedented shortage in the zombie food supply chain, leaving reanimated consumers with dwindling options.',
  '<p>NECROTROPOLIS — The rapid adoption of GLP-1 receptor agonists among the living population has triggered what industry analysts are calling the most severe disruption to zombie food infrastructure since the Great Preservative Shortage of 1847. The Necronomic Advisory Group estimates that continued uptake of semaglutide and tirzepatide compounds could reduce available biomass by up to 34% within the next fiscal quarter.</p>
<p>"We are facing a caloric cliff," said Dr. Mortimer Gravewell, director of the Undead Nutrition Research Institute. "The average human has lost 17 pounds since 2023. That is 17 pounds of substrate that is no longer available to our consumers. The math is simple, and it is catastrophic."</p>
<p>The crisis has already forced several regional distributors into emergency rationing. Eternal Harvest LLC, the largest zombie food supplier in the Northeast Corridor, announced Thursday that it would suspend premium-tier deliveries and redirect inventory to essential services, including hospital morgue cafeterias and municipal reanimation centers.</p>
<p>The Zombie Food Workers Union, ZFWU Local 31, has called for emergency federal intervention, including subsidies for alternative protein development and a moratorium on GLP-1 prescriptions within designated feeding zones. "Our members are already working double shifts at half the caloric intake," said shop steward Rotwell Shamble. "Something has to give."</p>
<p>The Underworld Bureau of Labor Statistics confirmed that zombie food sector employment has declined 12% year-over-year, with further layoffs expected if current trends continue. The Vampire Council, which oversees inter-species commerce regulation, has scheduled an emergency session to address cross-sector supply chain implications.</p>',
  (select id from sections where slug = 'undead-health'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-03-05T08:00:00Z',
  'user'
);


-- Article 2: Vampire Affairs
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  'Microplastics Detected in Premium Vampire Blood Products',
  'microplastics-vampire-blood',
  'The Vampire Council''s Bureau of Hemoglobin Standards confirms contamination in Northeast Corridor blood banks, prompting an immediate advisory.',
  '<p>SANGUINE HEIGHTS — Laboratory analysis conducted by the Vampire Council''s Bureau of Hemoglobin Standards has confirmed the presence of microplastic particulates in commercially distributed blood products across the Northeast Corridor, prompting an Elevated Advisory and a full audit of all licensed blood banks operating under Council jurisdiction.</p>
<p>The contamination was first detected during routine quality assurance testing at the Crimson Reserve facility in Lower Nocturn. Technicians identified polyethylene terephthalate fragments in three separate batches of Type O-Negative, the most widely consumed grade among registered vampires. Subsequent testing revealed contamination levels ranging from 12 to 47 micrograms per liter across 14 distribution centers.</p>
<p>"This is not a recall. This is a systemic issue," said Councilor Vladislav Duskmantle during a press briefing at Council Hall. "The contamination originates in the donor population. These plastics are in their bloodstream before we ever process it. We are, in effect, inheriting the living world''s pollution crisis."</p>
<p>The announcement has sent shockwaves through the vampire consumer market. Shares of BloodCorp International fell 8.3% in after-hours trading on the Dark Exchange. Hexblood Organics, a boutique supplier specializing in pre-industrial donor sourcing, saw its stock surge 22% as consumers scrambled for certified clean alternatives.</p>
<p>The Council has advised all vampires to source from certified pre-industrial donors until the full audit is complete. A public comment period on proposed new filtration standards will open next week.</p>',
  (select id from sections where slug = 'vampire-affairs'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-03-04T12:00:00Z',
  'user'
);


-- Article 3: Demon Politics
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  'Source of All Evil Files Chapter 11 Bankruptcy',
  'source-evil-chapter-11',
  'The metaphysical entity announces restructuring amid declining market share and regulatory pressure from the Infernal Revenue Service.',
  '<p>THE NINTH CIRCLE — The Source of All Evil, the primordial metaphysical entity responsible for an estimated 73% of global malevolence output, filed for Chapter 11 bankruptcy protection late Wednesday in the Infernal District Court, citing declining market share, unsustainable operational costs, and mounting regulatory pressure from the Infernal Revenue Service.</p>
<p>The filing, which lists liabilities in excess of 4.7 trillion damnation credits, marks the largest supernatural bankruptcy in recorded history. Court documents reveal that the Source has been operating at a loss since fiscal year 2019, when a combination of social media-driven misinformation and freelance malevolence operators began eroding its core business model.</p>
<p>"Humans have gotten remarkably good at generating evil on their own," said Baalthazar Grimshaw, the Source''s chief restructuring officer. "Our traditional value proposition — centralized, reliable, wholesale evil — has been undercut by distributed, artisanal cruelty at scale. The market has simply moved on."</p>
<p>The restructuring plan envisions a leaner organization focused on premium evil services, including bespoke curses, luxury-tier temptation packages, and enterprise corruption consulting. The Source intends to divest its legacy portfolio of plagues, famines, and general pestilence, which analysts say have become commoditized.</p>
<p>The Demon Workers'' Solidarity Collective has expressed concern about potential layoffs. "Thousands of imps, tempters, and mid-level tormentors depend on this entity for employment," said collective representative Azmodea Thornveil. "Restructuring cannot come at the cost of infernal working families." The court has scheduled a creditors'' hearing for the first Monday after the next blood moon.</p>',
  (select id from sections where slug = 'demon-politics'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-03-03T10:00:00Z',
  'user'
);


-- Article 4: Werewolf Rights
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  'Were-Local 17 Ratifies Landmark Moonlight Overtime Provisions',
  'were-local-17-overtime',
  'The historic agreement guarantees lunar accommodation and mandatory transformation breaks for all registered lycanthropes in the tri-territory area.',
  '<p>HOWLINGTON — Members of Were-Local 17, the largest lycanthrope labor union in the tri-territory area, voted overwhelmingly Thursday to ratify a landmark collective bargaining agreement that includes moonlight overtime provisions, mandatory transformation breaks, and enhanced lunar accommodation protections for all registered werewolves employed in covered industries.</p>
<p>The agreement, reached after 14 months of negotiations with the Tri-Territory Employers'' Council, guarantees time-and-a-half pay for all work performed during full moon periods, defined as the 72-hour window surrounding peak lunar illumination. It also mandates a minimum 45-minute transformation break at moonrise, with access to designated shifting facilities that meet new safety and privacy standards.</p>
<p>"This is the most significant advancement in lycanthrope labor rights since the Fur and Fang Act of 1978," said Luna Packrunner, Were-Local 17 shop steward and lead negotiator. "For decades, our members have been forced to choose between their livelihoods and their biological reality. That ends today."</p>
<p>The Tri-Territory Employers'' Council issued a statement acknowledging the agreement while noting concerns about implementation costs. "We respect the collective bargaining process and are committed to compliance," said Council spokesperson Reginald Moorecroft. "However, we urge policymakers to consider tax incentives for employers who invest in shifting infrastructure."</p>
<p>The new provisions take effect at the next new moon. The Underworld Department of Labor has announced it will publish compliance guidance within 30 days. Were-Local 17 represents approximately 8,400 active members across manufacturing, logistics, and municipal services sectors.</p>',
  (select id from sections where slug = 'werewolf-rights'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-03-02T14:00:00Z',
  'user'
);


-- Article 5: Spirit World
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  '5G Tower Expansion Disrupts Spectral Communications Nationwide',
  '5g-spectral-disruption',
  'FCC Ethereal Spectrum Division launches investigation as ghost-to-ghost call quality drops by 40% in affected regions.',
  '<p>PHANTASMA, D.C. — The FCC''s Ethereal Spectrum Division announced Friday that it has opened a formal investigation into the impact of 5G cellular tower expansion on spectral communications infrastructure, following a 40% decline in ghost-to-ghost call quality across 23 metropolitan haunting districts.</p>
<p>The disruption, which has been building since carriers began deploying millimeter-wave 5G equipment in densely haunted urban corridors, has left millions of registered spirits unable to maintain stable ethereal connections. Complaints to the Spectral Communications Commission have surged 312% since January, with reports ranging from garbled transmissions and phantom echoes to complete signal dissolution during peak haunting hours.</p>
<p>"The 28-gigahertz band that 5G operates on sits directly adjacent to the primary ectoplasmic resonance frequency," explained Dr. Ephemera Voss, chair of spectral engineering at Wraith University. "The interference pattern is predictable and, frankly, was predicted. We published a warning paper in 2022 that was roundly ignored by both the FCC and the telecom lobby."</p>
<p>The National Association of Registered Haunters has called for an immediate moratorium on new tower installations within 500 meters of any certified haunting site, historic cemetery, or spectral transit corridor. "Our members have occupied these frequencies for centuries," said NARH president Cornelius Fogsworth III. "The living cannot simply appropriate our bandwidth because they want faster video streaming."</p>
<p>The FCC Ethereal Spectrum Division has pledged to issue preliminary findings within 90 days. In the interim, the agency has recommended that affected spirits switch to legacy analog channels where available, though officials acknowledge that analog spectral infrastructure has been in decline since the Great Digitization of 2011.</p>',
  (select id from sections where slug = 'spirit-world'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-03-01T09:00:00Z',
  'user'
);


-- Article 6: Occult Markets
insert into articles (headline, slug, dek, body_html, section_id, author_id, status, published_at, article_type)
values (
  'Grimoire NFT Market Collapses as Enchantment Verification Fails',
  'grimoire-nft-collapse',
  'Investors burned after on-chain spell authentication proved unreliable across planar boundaries, wiping out an estimated 2.1 billion hex-coin in market value.',
  '<p>ARCANA FINANCIAL DISTRICT — The nascent grimoire NFT market suffered a catastrophic collapse this week after it emerged that the blockchain-based enchantment verification system underpinning the entire sector cannot reliably authenticate spells across planar boundaries. The failure has wiped out an estimated 2.1 billion hex-coin in market value and left thousands of investors holding digitally tokenized grimoires with no verifiable magical properties.</p>
<p>The crisis began when Mystic Ledger Labs, the startup behind the SpellChain verification protocol, acknowledged in a regulatory filing that its cross-planar oracle system had been returning false positives at a rate of approximately 67%. In practical terms, this means that two-thirds of all grimoire NFTs sold on major exchanges over the past eight months may contain no functional enchantments whatsoever.</p>
<p>"We believed the oracle architecture was sound," said Mystic Ledger CEO Thandril Ashweaver in a prepared statement. "Unfortunately, the fundamental incompatibility between deterministic blockchain consensus and the inherently probabilistic nature of magical energy proved to be an engineering challenge we underestimated."</p>
<p>The Occult Securities and Exchange Commission has issued a cease-and-desist order against three major grimoire NFT exchanges — HexBay, DarkMint, and Enchant.io — and frozen all pending transactions until a forensic audit can be completed. Commissioner Isolde Blackthorn warned that criminal referrals are under consideration. "Selling unverified magical instruments to retail investors is not innovation," she said. "It is fraud."</p>
<p>Market analysts at Hexworth Analytics note that the collapse mirrors the pattern of previous speculative bubbles in the occult financial sector, including the Philosopher''s Stone futures crash of 2008 and the Elixir of Life Ponzi scheme of 2015. "The underlying technology may eventually prove viable," said senior analyst Grimwald Tench. "But the market got ahead of the magic, as it always does."</p>',
  (select id from sections where slug = 'occult-markets'),
  '00000000-0000-0000-0000-000000000001',
  'published',
  '2026-02-28T11:00:00Z',
  'user'
);
