# Acutis Community database

This directory owns Community database operational scripts and rollback material.

The existing `CommunityDbContext`, entity model, EF migrations, migration identifiers, and model snapshot remain intact inside `acutis.community.api/src/Acutis.Community.Api`. They were not split into a new project or regenerated during the repository reorganisation.

The database name, connection-string key, migration ordering, tenant identifiers, membership boundary, and audit persistence remain unchanged.
