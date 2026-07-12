# Acutis Practitioner database

This directory owns Practitioner database operational scripts and rollback material.

The existing `PractitionerDbContext`, entity model, EF migrations, migration identifiers, and model snapshot remain intact inside `acutis.practitioner.api/src/Acutis.Practitioner.Api`. They were not split into a new project or regenerated during the repository reorganisation.

The database name, connection-string key, migration ordering, tenant identifiers, membership boundary, audit persistence, and secure one-to-one records remain unchanged.
