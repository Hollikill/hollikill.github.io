# TODO

# quick tasks

- [ ] add job/skill requirements
- [ ] create skill system
- [ ] add currency display
- [ ] add age + age display

---

## larger tasks

- [ ] add homes and items + happiness display
- [ ] add job categories

---

## very complex tasks

- [ ] make jobs, skills, homes, items procedural
  - [ ] create dict of job componenets. mix of job types and adjectives
    - job types:
      - weights for each:
        - cultural
        - income
        - technology/affinity (corresponds to skill technology/affinity)
        - advancedness
      - larger category
        - Civilian
        - Military
        - Awakened
    - job adjectives (modifiers such as silver- blacksmith or enchanting- blacksmith)
      - certain adjectives are locked to technology/affinity
  - [ ] create master list of skills
    - skills for each world are a mix of various master-skills, usually adding up to about 1. The scaling and base power of each component skill is static.
      - EXAMPLES:
        - HISTORY skill: 0.21 languages, 0.56 learning, 0.02 bargaining, 0.24 productivity
        - ACCOUNTANT skill: 0.42 productivity, 0.65 bargaining, 0.01 time warping
      - More powerful worlds may buck this trend.
    - weights for each:
      - power/rarity (each world should have total skill componenets of these roughly evenly distributed, with some MINOR gain or loss depending on random chance)
  - [ ] create list of house components
    - domain sizes first
    - master list of house base componenets
    - adjective list. Each adjective modifies a house base component cost and effect (not neccessarially in the same way), with a small random distribution +- from the default. Houses with no adjectives also have a little variation.
  - [ ] create list of item/service components
    - seperate lists for items and services
    - short adjective list. Similar to house adjectives.
    - items/services have static effects, though power can vary with adjectives
- [ ] add owning vs. renting houses/items
  - [ ] neccesarialy also add conditions for when you can control a world or part of world
- [ ] add variation that seperate 'universe size' from 'world development level'
  - [ ] allow creation of buildings past a max technology level of a world
    - flat monetary cost, hardcapped by the largest house size than can be contained in the 'universe size'
  - [ ] allow creation of items past a max technology level of a world
    - flat monetary cost, requires sufficient skill prerequisites, softcapped past 'universe size' tech level via a multiplier to all costs
- [ ] add death + in-world legacy tallying
- [ ] add combat and dangerous jobs
- [ ] add ascended worlds & transcension
  - additional world stages that essentialy add content when the player has transcended the boundries of their world.
  - releases some restrictions on powers of alternate awakened systems
  - transcension initiates player into a more generic system, where the size of the world they transcended from matters
    - the largest worlds can accomodate ascended world content without transcension. World Selection cannot really access these worlds without a legacy that is transcended or near-transcended The system changes from normal transcension are:
      - early acess to ascended homes/items. jobs/skills are still locked behind transcension
      - lengthening of the bottom half of transcension requirements scale (more effective low-quality entry and lower base requirement), and shorting of the top half (less effective high-quality transcension)
      - much higher maximum cap on random event danger