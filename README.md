# Unofficial Mutants and Masterminds 3rd Edition for FoundryVTT
The *unofficial* system for [FoundryVTT](https://foundryvtt.com) 0.7.9. It supports a character sheet for players and NPCs and a drag-drop system for powers, effects, and modifiers.

## Install
This system has not yet been submitted to FoundryVTT and will not show up in the system browser. This will change once the MVP Roadmap has been completed.

If you wish to manually install the system, follow the steps in the [Local Development](#local-development) section and copy the contents of the `dist` folder into `<foundryvtt_data_folder>/Data/systems/mnm3e`.

## System Goals
### Ease of Use
The main goal of this system is to make it easy to build powers and effects via dragging and dropping. Each effect defines set of parameters that determines if a roll is needed, what to do in an attack, and the total DC of the resistance check if necessary. Modifiers can be dragged and onto effects to override these parameters and the effect itself can be dropped into a power.

## MVP Roadmap
- [x] Character
    - [x] Data model
    - [x] Sheet rendering
    - [x] Complete sheet layout
    - [x] Sheet CSS Styling
- [x] NPC
    - [x] Data model
    - [x] Sheet rendering
    - [x] Complete sheet layout
    - [x] Sheet CSS Styling
- [x] Powers and Equipment
    - [x] Data model
    - [x] Arrays and Linked Effects
    - [x] Drag and drop modifiers
    - [x] Overridable effects
    - [x] Sheet rendering
    - [x] Complete sheet layout
    - [x] Sheet CSS Styling
- [ ] Compendium populated with data from [d20herosrd](https://www.d20herosrd.com)
    - [ ] Advantages
    - [ ] Power Effects and Modifiers
    - [ ] Weapons
    - [ ] Armor
    - [ ] Gadgets
- [ ] Tools
    - [ ] Measurement calculator
    - [x] Modifier/Effect Summary Builder
- [x] Conditions

## Local Development
Create a file named `foundryconfig.json` at the root of the repository with the following contents:
```jsonc
{
    "dataPath": "<foundryvtt_data_folder>",
    "repository": "git@github.com:matthewswar/foundryvtt-mutants-and-masterminds.git",
    "rawURL": "https://raw.githubusercontent.com/matthewswar/foundryvtt-mutants-and-masterminds"
}
```

Use `npm run build` or `npm run build:watch` to compile and copy files to the distribution folder.

## Issues
Feel free to submit issues and enhancement requests.

## Contributing
Code and content contributions are accepted and encouraged. Please fork the repository and submit a pull request so your changes can be reviewed before merging.

## Related Websites
- https://foundryvtt.com
- https://www.d20herosrd.com
- https://game-icons.net

## Licenses
### game-icons
Licensed under the [CC BY 3.0 License](https://creativecommons.org/licenses/by/3.0/)
Icons made available by the authors delapouite and Lorc from [game-icons](https://game-icons.net).