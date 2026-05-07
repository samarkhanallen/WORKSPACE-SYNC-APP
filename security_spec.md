# Security Specification: SYNC-EAZY Task Manager

## 1. Data Invariants
- A `Project` must have at least one member (the owner).
- Only members of a `Project` can view its `Tasks`.
- Only the `ownerId` of a `Project` or an `admin` user can delete the project.
- `Tasks` must belong to a valid `projectId`.
- `User` roles (`admin`/`member`) cannot be self-assigned; they must be managed by the system or another admin.

## 2. The "Dirty Dozen" Payloads (Deny List)
1. **User Role Spoofing**: Signed-in user tries to create their profile with `role: "admin"`.
2. **Project Hijacking**: Non-member tries to read a project document.
3. **Task Injection**: Non-member tries to create a task in a project they don't belong to.
4. **Member Escalation**: Member tries to update a Project to add themselves as the `ownerId`.
5. **Ghost Task**: Creating a Task with a random `projectId` that doesn't exist.
6. **Task Status Poisoning**: User tries to update a Task status to an invalid value like `"completed_fake"`.
7. **Identity Theft**: User A tries to update User B's profile.
8. **Resource Exhaustion**: Creating a Task with a 2MB description string.
9. **Terminal State Bypass**: Updating a task that is marked as "done" (if locking is enforced).
10. **Admin Access Bypass**: Regular user tries to list all `users` in the system.
11. **Immutability Breach**: Updating a task's `createdAt` timestamp.
12. **ID Poisoning**: Creating a project with a 2KB long string as ID.

## 3. Test Runner (Draft)
I will implement `firestore.rules.test.ts` after drafting the rules to verify these scenarios.
