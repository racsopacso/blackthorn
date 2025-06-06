# Changelog

## 11.1

- Bugfix: Restored Custom HD formulas for animal companions and eidolons
- Cleanup: removed lifesense UMR
- Cleanup: removed Robe of the Archmagi
- Cleanup: Updated many artifacts, cursed items, magic items, and wondrous items with materials and base item stats

## 11.0.1

- Migrated content for use with PF1E v11

## 11.0.0

### Changelog

- Bugfix: Hamatulatsu Feat had incorrect prerequisites
- Changed: Updated racial traits with v11 updates to senses, movement and other contributions from server
- Changed: Updated Format of Combat Trick Feats
- Changed: Add Tags for Combat Trick Feats
- Changed: Artifact Weapon item type and icons
- Changed: Moved Usage instruction to newly introduced field.
- Cleanup: removed universal monster rule features
- Cleanup: removed vision based Buffs
- Cleanup: removed druid domains
- Cleanup: removed 'Extra'-feats
- Cleanup: removed movement feats
- Cleanup: removed monster feats
- Cleanup: removed robe of the archmagi (#122)
- Cleanup: removed Reaver's Scythe
- Cleanup: removed Kineticist content
- Cleanup: removed redundant greater hat of disguise
- Cleanup: migrated sources from descriptions to source field and enrichers (#143 and #145)
- Cleanup: removed redundant occult items (#154)
- Cleanup: removed price, weight, category, and other information from descriptions when possible (#155)

## 10.2.0

### Changelog

- Changed: Updated racial traits to latest community contributions
- Changed: Moved 3rd-party content like EitR to a dedicated compendium
- Fixed: removed empty prerequisites in EitR Content
- Fixed: removed several empty html paragraphs
- Fixed: added missing iteratives on weapons
- Fixed: natural invisibility subtype
- Fixed: web universal monster rule range increment
- Fixed: Magical ammunition lacked ammo type
- Cleanup: removed Kingdom Building Content -> Use https://foundryvtt.com/packages/pf1-kingdom-sheet instead
- Cleanup: removed duplicated bag of holding, minor
- Cleanup: removed duplicated ring of energy Resistance

## 10.1.1

### Changelog

- Fixed: Updated the custom compendium loading to SBC due to changes on SBC's end.

## 10.1.0

### Changelog

- Added: Aberrant Unchained Eidolon base form was missing (both medium and small versions)
- Changed: Removed Source abbreviations from descriptions
- Changed: Reorganized and enhanced core race racial traits
- Changed: Ensured racial trait icons matched their respective races' icons
- Changed: Updated buffs with more accurate v10+ categories
- Changed: Removed duplicate items that existed in the system
- Changed: Updated tooling, readme, and contribution processes
- Changed: Haunts were rebuilt to use the new haunt actor type
- Fixed: Many typos in descriptions
- Fixed: Buffs with an end time are now respected
- Fixed: Removed Category dictionary tags to avoid conflicts and lots of noise for users
- Fixed: Magic Item Generator roll table was broken
- Fixed: Magic Items, Artifacts, and Cursed items lacked enhancement bonus

## 10.0.0

### Changelog

- Added: Content was migrated for PF1E v10.3, along with many changes to work with the new features in the system.
- Added: MANY if not all traits have various changes, actions, usage limitations, context notes, and script calls to improve usability.
- Added: The Dwarven alternate racial trait "Mountaineer" was missing".
- Added: Niobe and Vampire Hunter D content moved from the system into a new "Paizo Collaborations" compendium.
- Added: All traits now have source information moved to the dedicated field.
- Added: Many new buffs have been created for common spell effects
- Fixed: Many typos and minor corrections in descriptions and context notes
- Changed: Wondrous Items now have an icon matching the slot they belong to.
- Changed: Traits now have an icon matching the type of trait.
- Changed: Many redundant/duplicated items were removed from PF-Content; some were moved to the system when better displayed.
- Changed: Technology has been moved to the system itself, following procedure when quality standards were met.
- Changed: Cursed items were moved to their own compendium.
- Changed: The descriptions for many class features were cleaned up.
- Changed: Trap actors were rebuilt to make use of the new Trap actor type. **Note**: Haunt actors not yet rebuilt.

## 0.3.7

### Changelog

- Fixed: removed duplicated roll table for Numerian Fluid
- Fixed: ring items were not properly typed and marked as such
- Fixed: corrected charge cost of Grenade Launcher
- Fixed: corrected stats for various Bracers of Armor
- Changed: organized Wondrous items into folders by slot
- Added: many optimizations of Tech items
- Added: marked various Tech weapons as automatic/scatter/slow-firing (as appropriate)

## 0.3.6

### Changelog

- Migrate module for PF1E v9.6
- MANY improvements to Tech items
- Removed MANY duplicate items that were transferred into the system.
- Moved archetype features over to PF-Archetypes instead
- Updated icons for Ranger Traps
- Removed duplicates
- Added Roll Tables for Numerian Fluid effects and Timeworn Glitches
- Renamed Strength Warpriest Blessing to be consistent with other Blessings
- Fixed broken item links in EitR compendium
- Fixed Earth Style feat chain icons
- Fixed missing texts in Kingdom Buildings
- Cleaned up links in Buffs compendium, as well as removing duplicate and/or unnecessary buffs
- Corrected erroneous formulas in Debilitating Injury buffs
- Corrected various Haste-like buffs to use Haste modifier
- Added missing movement speeds to various buffs

## 0.3.5

### Changelog

- Migrate module for pf1 v9 and tentative v11 support

## 0.3.4

### Changelog

- Migrate module for pf1 82.5 and foundry 10.291

## 0.3.3

### Changelog

- Migrate module for pf1 82.2 and foundry 10.287
- Add Buffs (with script calls) for new Senses implimentation (thanks @Folken#9051)
- Includes: Blindsense, Blindsight, Darkvision, Low-light, Invisibility, See invisibility, tremorsense, trusight, and scent
- Add Buffs for Fast Heal, Regen, and Bleed (requires Koboldworks - Regeneration)
- Fix double penalty for Combat Expertise buff
- Fix cost of Dusty Rose Cracked Ioun Stone

## 0.3.2

### Changelog

- Migrate module for pf1 81.3 and foundry 9.269
- Actually include updates to companions and features, eidolons, and evolutions (Thanks @websterguy#1136)
- Create local version of PFS and 3.5e icons

## 0.2.8

### Changelog

- Migrate module for pf 80.23 and foundry 9.269
- Import new/fixed rolltables for various items (thanks @JustZisGuyYouKnow#3965 !)
- Updates to companions and their features, eidolons and their evolutions (Thanks @websterguy#1136)

## 0.2.7

### Changelog

- Fix Portable Hole
- Updates to latest version of Foundry and PF1

## 0.2.6

### Changelog

- Update process for Contributing
- Add Contributing.md
- Adjust minimum and compatible versions to be 9, rather than a more specific build
- Migrate module for pf 80.9 and foundry 9.249

## 0.2.5

### Changelog

- Made Handy Haversack a container with 100% weight reduction
- Added skill modifiers and icon to Headband of Vast Intelligence
- Added modifiers to Cloak of Resistance
- Fixed merge script
- Fix file naming to avoid errors
- Added Changes to some Ioun stones

## 0.2.4

### Changelog

- Add script that allows for merging of new items to compendiums (see github for instructions)
- Modified update process

## 0.2.3

### Changelog

- Migrate to latest foundry v0.9.242

## 0.2.2

### Changelog

- Migrate to latest foundry v0.8.9
- Add Common Weapon Enchant Conditional Modifiers to PF-Special Qualities compendium

### Bugfixes

- Fixed alchemist's fire not being a single-use consumable, and adding dex to attack

## 0.2.1

### Bugfixes

- Evil eye AC and Skill Debuffs had incorrect Changes

### Changelog

- Finished Harrow Deck (Has custom artwork for cards and fixed broken links)
- Merge various Let's Contribute changes.

## 0.2.0

### Changelog

- Update to 0.8.8 and pf1 0.78.15
- Merge Contribution changes
- Add PF-Deities

### Bugfixes

- Fixed missing weight values on Kits
- Fixed several broken icons
- Fixed mismatched description for Draconic Bloodline (Sorcerer)

## 0.1.72

### Changelog

- Migrate Mythic Adventures and Horror adventures to PF1e Rulebooks
- Update compatibility

### Bugfix

- Fixes for Companions
- Additional formula fixes for eidolons (thanks websterguy for both)

## 0.1.71

### Bugfix

- Fix formulas for Eidolons (thanks webster)
- Merge changes through Let's Contribute

## 0.1.70

### Changelog

- Added Occult Rituals

## 0.1.69

### Changelog

- Added Technology Weapons and Armor

## 0.1.68

### Changelog

- Update compatibility for 0.7.10
- Merged a large number of context/changes for Feats (Thanks apetina)
- All Core Feats should now have context notes or changes
- Moved PF-Class Abilities from the Archetypes module to pf-content
- Added Technology gear (Artifacts, Cybertech, Pharmaceuticals, and Misc items)

### Bugfix

- Remove extra -5 penalty to secondary eidolon attacks
- fix image links for Elephant in the Room rules
- Fixed formulas related to Eidolons

## 0.1.67

### Changelog

- Added Magic item roll tables, linked to pf-content
- Also includes Magic Shop Random Item generator, based on town size.

## 0.1.66

### Changelog

- Added/Updated Elephant in the Room rules (contributions from ChaosCowboy)
- Added a d20pfsrd web journal in GM Quick Reference

### Bugfixes

- Fixed several bugs related to Eidolon formulas (Thanks websterguy and Erickira)
- Fixed Eidolon Forms being empty
- Fix broken links for Random Diseases roll table

## 0.1.65

### Changelog

- Added Eidolon Base Forms (PF-Eidolon Forms)
- Added Eidolon Class, and Eidolon evolutions (PF-Eidolon Evolutions)
- Merged Changes from Let's Contribute
- Removed (Su/Ex/Sp) from Universal Monster Rule names

## 0.1.64

### Changelog

- Added Haunts, Curses, and Madness
- Renamed PF-Traps to PF-Traps and Haunts
- Renamed PF-Diseases to PF-Maladies (includes Curses, Madness, and Diseases)
- Reworked Animal Companions and Animal Companion Features (thanks websterguy)

## 0.1.63

### Changelog

- Add Drugs (Thanks Vormav)
- Added ~412 Default Racial Traits (excluding the stat bonus ones and a few redundancies)
- Merged ~50+ Changes contributed by the community (Thank you all!)

## 0.1.62

### Changelog

- Add Animal Companion Class and features (created by Fair Strides)
- Add 209 Animal Companions and pets
- Add more rules and links to PF-Rules for Companions

## 0.1.61

### Changelog

- Add 177 Familiars and Pets (PF-Familiars)
- Add Rules for Familiars (and limited for Companions) to PF-Rules
- Add Tips and tricks to GM Quick Reference compendium
- Add Change formula reference sheet to GM Quick Reference (For use in creating/adding changes to items/features)
- Merge Let's Contribute contributions

## 0.1.60

### Changelog

- Add 149 Poisons
- Add Harrow Deck rules (Cards still WIP)
- Add Random Encounter Tables

## 0.1.59

### Changelog

- Added merges from Let's Contribute for various feats, and traits
- Added Horror Adventures Rulebook
- Added Horror Adventure tables to PF-Tables
- Added a bunch of buffs/debuffs
  Banner (Cav)
  Bless weapon
  Bungle
  Chastise
  Climbing
  Crafter's Fortune
  Common Conditional Modifiers (As an attack to allow for copying to others)
  Flanking
  Outflank
  Study Target
  Sneak Attack
  Precise Strike
  Bonus to DC
  Charging
  Increased Charge cost
  Crit Confirm Bonus
  Debilitating Injury
  Faerie Faerie
  Fumblestep
  Ghostbane Dirge
  Gravity Bow
  Greater Banner (Cav)
  Heroes' Feast
  Hobble
  Ill Omen
  Lead Blades
  Longshot
  Longstrider, Greater
  Lunge
  Magic Fang
  Magic Fang, Greater
  Mutagens (Str/Con/Dex)
  Monkey Fish
  Pass Without Trace
  Rage (Spell)
  Rage (Barbarian - Scales up to level 20)
  Rage UC (Scales up to level 20)
  Virtue
  Vigor

## 0.1.58

### Changelog

- Added Subrace info to PF-Rules under Basic Rules
- Added Weapon and Armor Special Qualities in PF-Special Qualities

## 0.1.57

### Changelog

- Added 747 Racial Traits

## 0.1.56

### Changelog

- Added Tips and Tricks, and Change Formula to GM Quick Reference
- Redid some of the Index organization for PF-Rules
- Added Weapon and Armor Materials to PF-Rules under Items
- Added Subrace descriptions in PF-Rules under Basic Rules

## 0.1.55

### Changelog

- Added a Grapple flow chart to GM Cheat sheet
- Added a couple Traps that were missing
- Added PF-Rules - contains huge amount of linked and organized rules for:
  - Basic Rules
  - Combat
  - Environment
  - Exploration
  - Gamemastering (Placeholder)
  - Items
  - Magic
  - Optional Rules (Hero Points, and Words of Power - the rest are incomplete)
  - Skills

### Bugfixes

## 0.1.54

### Bugfixes

- Renamed files to be consistent

### Changelog

- Added 70 Traps
- Added 72 Diseases
- Added the start of PF-Rules, which will be added to in the future
- Added a GM Quick Reference compendium with several journal entries to aid GMs
- Added Mythic Adventures Rulebook (Contains, in essence, the entire book, organized by number and folder)

## 0.1.53

### Changelog

- Added Kingdom Building Rules (GM and Player version)
- Added Buildings and some terrain as NPCs
- Added Icons for buildings and terrain
- Added two scenes for the District Grid

### Bugfix

- Adjusted formatting for item description text

## 0.1.52

- Bug fix with manifest error

## 0.1.51

### Bugfixes

- Adjusted formatting of text and headers for better readibility

## 0.1.50

### Changelog

- Added 1,855 non-magical items
- Added 147 Universal Monster Rules
- Added NPC merchants for main categories of items
- Added rolltables for main categories of items
- Created PF-Items
- Created -PF-Goods and Services
- Created PF-Merchants
- Created PF-Tables

## 0.1.46

### Bugfixes

- Fixed incorrect change in Haste buff
- Fixed broken images in Magic Items due to case sensitive extensions

### Changelog

- Added 'Squeezing' buff and variants
- Enable 3.5e content by default
- Add debuffs for Misfortune and Evil Eye

## 0.1.45

### Bugfixes

- Fixed spacing and missing tags on Draconic Heritage and Hellknight Obediance

### Changelog

- Added 513 traits missing from race and regional categories
- Added 84 3.5 Pathfinder compatible traits to a 3.5 content compendium
- Added 20 3.5 Pathfinder compatible feats to a 3.5 content compendium
- Tagged Pathfinder Society legal traits with a PFS tag, and added Pathfinder Society notes to those with PFS specific mechanics
- Traits should now be considered complete
- Added Pathfinder Society notes to feats with PFS specific mechanics

## 0.1.44

### Changelog

- Updated description, changelog, and credits files
- Added additional templates
- Fixed various errors with feat tags

## 0.1.43

### Changelog

- Temporarily removed traps for improvement

## 0.1.42

### Changelog

- Finished feats, added icons to them and reviewed for errors
- Added 306 traits including missing social, religion, and drawbacks

## 0.1.41

### Bug Fixes

- Fixed numerous errors within feats

### Changelog

- Added Traps (from AoN)

## 0.1.40

Changelog

- Added 88 faith traits

## 0.1.39

### Bug Fixes

- Fixed some grammar and formatting issues within a number of feats

### Changelog

- Added 384 more traits including campaign, combat, cosmic, equipment, exemplar, faction, family, magic, and mount traits
- All traits now have icons and category tags

## 0.1.38

### Changelog

- Replaced feats from scratch
- Now includes a total of 3,503 feats, sourced directly from AON
- Majority of feats include icons

## 0.1.37

### Changelog

- Added 115 new buffs and variants to pfbuffs.db

## 0.1.36

### Changelog

- Added credits, and appropriate section 15 copyright info.
- Updated module.json

## 0.1.35

### Bug Fixes

- Updated broken buff icons (bears endurance, bless, bull's strength, cat's grace, charging, combat expertise, concealment, cover, eagle's splendor, flanking, fox's cunning, heroism, invisibility, mage armor, owl's wisdom, partial cover, shield, shield of faith, slow, total concealment, total defense,)

### Changelog

- Added Elephant in the Room system (not enabled by default)
- Added package for buffs

## 0.1.0

### Changelog

- Added packages for artifacts, feats, spells, character traits, and wondrous items
- Added templates for ammo, armor, artifact armor, artifact equipment, artifact weapons, npcs, rings/other, rods, shields, staves/wands, weapons and wondrous items
- Added LICENSE for GNU General Public License
- Added OGL.txt for Open Game License Version 1.0a
- Added Legal.text for Paizo Inc.
- Added README.md
- Added changelog.md
- Added module.json
