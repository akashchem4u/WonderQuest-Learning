# WonderQuest Supabase Assets

This folder contains the local database foundation for the WonderQuest prototype.

- [migrations](./migrations): schema files for the prototype data model
- [seed](./seed): starter seed data for launch bands, themes, and subjects

The launch model assumes:

- lightweight username and 4-digit PIN access
- persistent progress even for tester accounts
- child, parent, and teacher reporting layers
- future migration to stronger authentication if needed
