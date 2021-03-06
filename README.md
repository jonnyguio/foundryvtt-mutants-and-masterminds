# Unofficial Mutants and Masterminds 3rd Edition for FoundryVTT
The *unofficial* system for [FoundryVTT](https://foundryvtt.com) 0.7.9. This project is currently
*work in progress* and many things are subject to change.

## Install
Currently it is not ready for installation. Please check back later.

## System Goals
### Ease of Use
The main goal of this system is to make it easy to build powers and effects via dragging and dropping. Each effect defines set of parameters that determines if a roll is needed, what to do in
an attack, and the total DC of the resistance check if necessary. Modifiers can be dragged and 
onto effects to override these parameters and the effect itself can be dropped into a power.

## Roadmap
- [ ] Character
    - [x] Data model
    - [x] Sheet rendering
    - [x] Complete sheet layout
    - [ ] Sheet CSS Styling
- [ ] NPC
    - [x] Data model
    - [x] Sheet rendering
    - [x] Complete sheet layout
    - [ ] Sheet CSS Styling
- [ ] Powers and Equipment
    - [x] Data model
    - [x] Arrays and Linked Effects
    - [x] Drag and drop modifiers
    - [x] Overridable effects
    - [x] Sheet rendering
    - [ ] Complete sheet layout
    - [ ] Sheet CSS Styling
- [ ] Compendium populated with data from [d20herosrd](https://www.d20herosrd.com)
    - [ ] Advantages
    - [ ] Power Effects and Modifiers
    - [ ] Weapons
    - [ ] Armor
    - [ ] Gadgets
- [ ] Tools
    - [ ] Measurement calculator

## Development Notes

### Why TypeScript?
I've found TypeScript easier to use than raw JavaScript.
[foundry-pc-types](https://gitlab.com/foundry-projects/foundry-pc/foundry-pc-types) has been
very valuable in the interface and class definitions it provides. However, there have been a few
interfaces and classes that I've had to override with my own definitions due to them being incomplete
or out of date in certain areas. Currently there are places in the code where I cast to `any` to
bypass these issues.

### Why [pugjs](https://pugjs.org)?
I find indentation scoped syntax is easier to work with and pugjs allows for a preprocessing layer.
I plan on using most of the toolkit pugjs offers at a later point.

## Related Websites
- https://foundryvtt.com
- https://www.d20herosrd.com
