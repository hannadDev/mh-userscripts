v2.0.1
- Rehauled the script to use external resources (scripts/stylesheets/json)

v1.9.0
- Added hats & scarves counter (Grabbed from logs when visiting camp page & stored locally)
- Enhanced UI

v1.8.2
- Accounted for offsets of 15/30/45 minutes off of UTC

v1.8.1
- Added timezone offset to date parsing to attempt to fix the 1 hour offset issue

v1.8
- Used custom popup instead of alert

v1.7
- Avoid using Date.parse() to try and fix for Safari browser
- Fixed issues that occur from untrimmed strings before parsing dates

v1.6
- Added max hunt tracker until shutdown.

v1.5
- Fixed issue in parsing date when it is already 12pm, it would add 12 resulting in an error parsing 24 as the hours.
- Added logs that appear when isDebug variable is true

v1.4
- Added max hunts counter below hunts needed in order to see if max aura is achievable.
- Changed message for players who have already achieved max aura.

v1.3
- Fixed math formula for hunts

v1.2
- Removed logs

v1.1
- Optimized calculateAura calls to changing page and hunting instead of all requests

v1.0
- Fixed parsing hours as int before adding 12

v0.9
- Fix constant issue
- Ceil hunts

v0.8
- Minor fix to modifying constant issue

v0.7
- Fixed max aura tooltip disappearing on any request