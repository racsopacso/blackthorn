# pf1-weather-macros
Added macros with functionality to follow PF1's weather rules found at:<br>
https://www.d20pfsrd.com/gamemastering/environment/weather/ <br>
Manifest URL: https://raw.githubusercontent.com/ntriel/pf1-weather-macros/main/module.json

# v1.0.12 UPDATE
Updating the module json to conform with v12 FoundryVTT Requirements and validated functionality with the same.

# v1.0.11 UPDATE
Release of 1.0.10 failed to include ft to m conversions. Fixing in this release.

# v1.0.10 UPDATE
Now checks units used in PF1 to change temp from F to C. (Doesn't retroactivly change previously generated weather)

# v1.0.9 UPDATE
Fixed issue where whispering message to GM didn't work if GM wasn't named "Gamemaster"

# v1.0.8 UPDATE
Fixed major issue where dates were being done incorrectly causing issues with creating and deleting notes from simple calendar.

# v1.0.7 UPDATE
Added check that user was GM before rendering Simple Calendar Side Panel, changed system definition in manifest json to remove warning from foundry vtt.

# v1.0.6 UPDATE
Updated to work for Foundry V11, replaced Simple Calendar side buttons with a panel that holds the dropdowns for weather rolls, season is now set based off what season Simple Calendar is set to (Will more than likely cause issue if a custom season is used in SC).

# v1.0.4 UPDATE
Added buttons to SimpleCalendar that remove current day weather report and one to remove all future weather reports.

# v1.0.3 UPDATE
Added functionality with SimpleCalendar (https://foundryvtt.com/packages/foundryvtt-simple-calendar) to add a weather report as a note on the calendar based off current date.
