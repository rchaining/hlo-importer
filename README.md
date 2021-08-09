[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coffee-%23FF5E5B?style=plastic)](https://ko-fi.com/slate) [![patreon](https://img.shields.io/badge/-support%20me%20on%20patreon-%235C5C5C?style=plastic)](https://patreon.com/slatesfoundrystuff) ![GitHub release (by tag)](https://img.shields.io/github/downloads/zarmstrong/hlo-importer/hlo-importer-0.7.5/total?style=plastic) ![GitHub all releases](https://img.shields.io/github/downloads/zarmstrong/hlo-importer/total?style=plastic) ![GitHub](https://img.shields.io/github/license/zarmstrong/hlo-importer?style=plastic)

# Foreword
HUGE thanks to zarmstrong, from whom this project was forked. If you like this fork or any of his projects, consider supporting him on patreon—or at any of the other above links! For absolute clarity, all of the above links direct to funding owned by zarmstrong.

This fork adds new items to the settings menu, allowing the GM to input the che character tokens for each of your player characters. One menu item will be created for each actor that has a user for an owner, and that user is NOT the Gamemaster. If you add a new actor with a player owner, refresh the page to update the settings. Find the element token for each PC in your game (described below) and insert them in the module configuration menu. To run the import, use the chat command "/update_users".

To do:
1. Create some way to inform the GM on what the status of the import is. Including how many sheets are to be imported, which sheet that is currently being imported, and when we're finished importing.
2. Create some way to detect if an import is being run when the user enters the /update_users command (see caveats)

Caveats: 
1. For any actors in the settings menu that you do not want to run an import on, simply leave that box blank.
2. When running your import over multiple actors, it will wait to begin importing the next actor until you acknowledge the dialog box. This keeps the speed of requests down, as the remote tool throws errors if you run a number of overlapping imports.
3. If you use the chat command /update_users while a previous import is running, your tool will break and possibly bork your character sheet. Do not do this.
4. This fork adds a dependency to the Chat Commands Library. Don't know if there's any compatibility issue, be aware of that. https://foundryvtt.com/packages/_chatcommands
5. Do not enable the original module and this one at the same time. I have absolutely no idea how that would behave.

Currently based on version 0.7.5 of the original import tool. If you run into bugs using this module, check the current version of zarmstrong's hlo-importer. If it's ahead of 0.7.5, consider using the base importer and check if the bug persists.
# Herolab Online PF2e Import Tool

A module for Foundry VTT that converts and imports Herolab Online 2e characters.

Please be aware that this module attempts to match Herolab Online items to Foundry items, and will not perform perfectly in all cases due to database differences.

## Navigation
1. [Important Note](#important-note)
2. [Guide for Importing from Herolab Online](#guide-for-importing-from-herolab-online)
3. [Getting your User Token from HLO](#getting-your-user-token-from-hlo)
4. [Getting the Element Token from HLO](#getting-the-element-token-from-hlo)
5. [Special Thanks](#special-thanks)
6. [License](#license)

## Important Note

This importer relies on my other tool, [Herolab to Foundry VTT PF2](https://github.com/zarmstrong/hlo-to-fvtt-pf2-public) to do the actual conversion process. If you have problems with the conversion, please be sure to [open a bug report on that project](https://github.com/zarmstrong/hlo-to-fvtt-pf2-public/issues).

## Guide for Importing from Herolab Online

1) Install this module or get your GM to do it in Foundry VTT.
2) Get the Element Token for the character you wish to import 
3) In *Foundry VTT* click Import from HLO, found right at the top of your character sheet next to the close button.
4) Enter the Element Token you got from Herolab Online and click import.
5) Wait about 30-45 seconds.
6) Verify the character name, class and level match your expectations. Take note of any messages from the conversion process, as you may need to make manual changes. When you're ready, click Proceed.
***
## Getting your User Token from HLO

(NOTE: If your character(s) are in a campaign, the steps are slightly different than below. In the campaign, open the character and click on the gear in the top right corner. Then follow the steps below starting at step 2)

Step 1: Click the Kebab menu on the character you wish to export<br>
![Click the Kebab menu on the character you wish to export](get-element-id-step1.webp)

Step 2: Click Export/Integrate<br>
![Click Export/Integrate](get-element-id-step2.webp)

Step 3: Click Get User Token<br>
![Click Get User Token](get-user-token-step3.webp)

Step 4: Click Copy to Clipboard<br>
![Click Copy to Clipboard](get-user-token-step4.webp)
***
## Getting the Element Token from HLO

(NOTE: If your character(s) are in a campaign, the steps are slightly different than below. In the campaign, open the character and click on the gear in the top right corner. Then follow the steps below starting at step 2)

Step 1: Click the Kebab menu on the character you wish to export<br>
![Click the Kebab menu on the character you wish to export](get-element-id-step1.webp)

Step 2: Click Export/Integrate<br>
![Click Export/Integrate](get-element-id-step2.webp)

Step 3: Click Get Element Token<br>
![Click Get Element Token](get-element-id-step3.webp)

Step 4: Click Copy to Clipboard<br>
![Click Copy to Clipboard](get-element-id-step4.webp)

*** 
#### Special Thanks

Special thanks to @Doctor-Unspeakable for his [Pathbuilder module](https://github.com/Doctor-Unspeakable/foundry-pathbuilder2e-import) for being the basis of this Foundry module.

### License
This Foundry VTT module is licensed under the [MIT License](https://github.com/zarmstrong/hlo-importer/blob/main/LICENSE).
This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).
