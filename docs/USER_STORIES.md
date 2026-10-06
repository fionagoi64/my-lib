# Library System User Stories

The stories follow the ClickUp groups in the supplied screenshots. They define the first delivery scope and acceptance conditions.

## Authentication & session management

- As a reader, I can log in with my email and password so that I can access my account.
- As a reader, I can reset a forgotten password so that I can regain access securely.
- As the system, I issue short-lived access tokens and revocable refresh sessions so that logout and session expiry are controlled.

## Book catalog & search

- As a reader, I can browse and search the catalog by title, author, and category so that I can find a book.
- As a librarian, I can create, edit, and retire catalog entries so that stock remains accurate.

## Borrowing, returns & extensions

- As a reader, I can view current loans, due dates, and renewal eligibility so that I can return books on time.
- As a librarian, I can record a loan or return so that inventory and the reader's loan history stay consistent.
- As the system, I prevent a loan when no copy is available and preserve the audit history of each transaction.

## Library rules & regulations

- As a reader, I can view current library rules so that I understand borrowing limits and policies.
- As an administrator, I can manage rules so that policy changes are published consistently.

## Reader profile & alerts

- As a reader, I can update my profile so that the library has current contact details.
- As a reader, I receive a live notification when a loan, return, extension, rule change, or librarian message affects me.
- As an administrator or librarian, I can send a notification to one reader or all readers so that important updates reach the right audience.

## Landing & contact

- As a visitor, I can read the library introduction and submit feedback so that I can decide whether to join or contact the library.
