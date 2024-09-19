__Journal Log Tracker__

v1.2
- Fixed an issue with entryId being a string causing issues when comparing and setting lastSavedEntryId
- Added Gold/Points scraping from entry
- Added First/Last buttons to pagination

v1.1
- Added pages count to pagination

v1.0
- Added Pagination
- Sorted in descending order

v0.9
- Added confirmation to log deletion

v0.8
- Added button to delete logs

v0.7
- Added manual fetch button

v0.6
- Fixed issue that prevented scraping properly

v0.5
- Fixed another issue in scraping dates but this time around 12am

v0.4
- Fixed issue with calculating date if 12 pm

v0.3
- Removed StaleBait and Entry from being saved in the object
- Fixed log # from being all 1s
- Fixed subtitle text

v0.2
- Fixed possible issue from scraping other players' journals
- Changed "Ready!" to showing how much time has passed since expected log time to appear

v0.1
- Initial version of the script. Timer & button to view log list, and ability to view each of the past logs.


__Golem Visit Stats__

v2.0.3
- Extracted some extra code to be added to external libraries

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