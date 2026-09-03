# Technology Selection Matrix

## Decision

Which mechanism should restrict who may change or delete an appliance type
marked approved, satisfying FR-029 and FR-030?

Framed from repository context rather than user input. Research R4 already names
three candidates and records the decision as blocking those two requirements.
A fourth candidate, doing nothing beyond the marking itself, is added here
because it is the current state and a real option, not a straw man.

## Evaluation Mode

`comparison`

## Candidates

1. **Advisory marking only.** FR-028 ships. Approved equipment is labelled and
   the label is honoured by convention. No enforcement.
2. **Passphrase on the approved set.** Changing approved equipment prompts for a
   shared secret held by whoever curates the set.
3. **Operating system user.** Approved equipment records the account that
   approved it; only that account may change it.
4. **Signed catalogue.** The organisation signs its approved set with a private
   key. The application verifies the signature and refuses local modification.

## Criteria

Criteria are drawn from stated constraints where possible. Weightings are
assumptions and are labelled as such.

| # | Criterion | Source | Weight |
|---|---|---|---|
| C1 | Fit to the actual threat | Unstated in the spec. **Assumption**: the concern is a colleague editing approved equipment carelessly, not maliciously. This is the single largest assumption in this document | High |
| C2 | Effectiveness given a local, owner-controlled database | ADR 0010: the catalogue is a local database in the main process | High |
| C3 | Implementation cost | Research R4 records the three differing "by an order of magnitude" | High |
| C4 | Operational burden on whoever curates | Implied by ADR 0010's "organisation curating a standard set" | Medium |
| C5 | Recoverability when the control is lost | **Assumption**: losing access to your own catalogue is a worse outcome than a careless edit | Medium |
| C6 | Dependency burden | `package.json` carries no crypto or auth dependency today; `node:crypto` is built in | Medium |
| C7 | Survives the catalogue being copied to another machine | Follows from ADR 0008 and 0010: files move between machines | Low |
| C8 | Consistency with existing project conventions | Constitution Principle III; no accounts, no server anywhere in the product | Medium |

## Matrix

Ratings: **strong**, **adequate**, **weak**, **none**. Each carries its reason.

| Criterion | 1. Advisory only | 2. Passphrase | 3. OS user | 4. Signed catalogue |
|---|---|---|---|---|
| C1 Fit to careless edits | weak — a label does not interrupt anyone | **strong** — a prompt interrupts exactly the accidental case | adequate — works until a shared login, which is common on shared workstations | strong — but aimed at a threat not yet claimed to exist |
| C2 Effectiveness on a local database | none — nothing to bypass | weak — the owner can edit the database directly | weak — same; the check is in the app, the data is not | adequate — verification can still be bypassed by modifying the application, but that is a far higher bar |
| C3 Implementation cost | none — already shipping | **low** — a stored hash and a prompt, using built-in crypto | low to medium — reading the account name is easy; the semantics of "same user" across platforms are not | high — key management, distribution, revocation, verification. Research R4 calls it "much the largest piece of work" |
| C4 Curator burden | none | medium — a secret to set, share and remember | low — nothing to manage | high — a signing key to generate, protect and distribute |
| C5 Recoverability | not applicable | weak — a forgotten passphrase locks the curator out of their own catalogue unless a reset exists | strong — nothing to lose | weak — a lost private key means no further approved updates |
| C6 Dependency burden | none | **none** — `node:crypto` is built in | none | medium — signing tooling, and a decision about key format |
| C7 Survives a copy to another machine | none | adequate — the hash travels with the catalogue | none — the account name will not match | **strong** — the signature is the point |
| C8 Fits existing conventions | strong — no accounts, no server, consistent with everything else | adequate — a local secret is not an account | weak — introduces machine identity into a product that has none | weak — introduces key infrastructure into a product with no server |

## Trade-offs

**The dominant trade-off is not between the candidates.** It is that a local
database owned by the person using it cannot be defended from that person. Every
candidate except signing enforces its rule inside the application while the data
sits beside it, editable by anything else on the machine. C2 is where all four
options are weak or worse, and no amount of mechanism choice changes that.

This reframes what is being bought. Options 2 and 3 prevent **mistakes**.
Option 4 raises the cost of a **deliberate** change from "edit a row" to "modify
the application", which is meaningful but not prevention. Only a managed device
or a server-held catalogue would give actual enforcement, and both are outside
the product described in `CONTEXT.md`.

Passphrase and OS user trade against each other cleanly. The passphrase works on
a shared login, which is the environment an organisation curating a standard set
most likely has, and it survives the catalogue being copied. The OS user has
nothing to lose or remember, which matters more than it sounds given C5.

## Risks

| Risk | Likelihood | Impact | Note |
|---|---|---|---|
| The assumed threat is wrong | Medium | High | If the concern is deliberate change, none of options 1 to 3 address it, and option 4 only raises the bar |
| A control is chosen that cannot be enforced | High if unexamined | Medium | Shipping a passphrase prompt reads as protection to a user who does not know the database sits beside it |
| Curator locked out of their own catalogue | Medium for option 2 | Medium | Needs a reset path, which reduces the control's strength further |
| Signing infrastructure outgrows the product | Medium for option 4 | High | Key management in an application with no server and no accounts |
| Scope creep into device management | Low | High | Real enforcement leads toward managed devices, which is a different product |

## Recommendation

**A short-listed selection, contingent on one answer.**

If the threat is careless edits, which is the working assumption: choose
**option 2, a passphrase on the approved set**. It addresses the assumed threat
directly, costs least of the enforcing options, adds no dependency, survives the
catalogue moving between machines, and does not introduce machine identity or
key infrastructure into a product that has neither. It needs a reset path, and
that reset path should be documented as weakening the control rather than
quietly added.

If the threat is deliberate change by someone using the application: **none of
these are adequate**, and the honest answer is that the product as described
cannot enforce it. That conversation is about managed devices or a server-held
catalogue, not about which local mechanism to pick.

Option 3 is the recommendation only if a forgotten passphrase is judged worse
than a shared login, which depends on facts about the deployment that nobody has
stated.

Option 4 is not recommended now. It is the only candidate that survives a
determined person, and research R4 is right that it is much the largest piece of
work. It is worth revisiting if approved sets are ever distributed between
organisations, which is the scenario where signing earns its cost.

Do not proceed to implementation on FR-029 and FR-030 from this document alone.
The threat question is answerable in one sentence by the product owner and
changes the recommendation.

## Evidence Gaps

- **The threat being defended against.** Stated nowhere. ADR 0010 records access
  control as in scope and names a use case for it, "an organisation curating a
  standard set", but never names who is being defended against. The same record
  is precise about this for the other half of the question, saying of encryption
  that it "defends a different threat, someone with the machine's storage rather
  than someone using the application, and no one has stated that threat yet".
  Access control never received the equivalent sentence. Checklist item CHK025
  asks for it and is unchecked.
- Whether approved sets are distributed between machines or organisations, or
  curated locally by one person.
- Whether shared logins are expected in the target environment, which decides
  between options 2 and 3.
- Whether a person locked out of their own approved set is an acceptable
  outcome, and what the reset path costs the control.
- Whether "restrict who may change" is intended to cover deletion, export and
  import of approved equipment, or only editing. FR-029 says "change or delete";
  FR-030 says only "change". CHK028 raises the import case separately.

## Follow-up Validation

1. Answer the threat question. One sentence from the product owner closes the
   largest gap in this document, and no experiment substitutes for it.
2. Resolve the FR-029 and FR-030 wording mismatch on whether deletion is
   covered, which is a specification fix rather than a selection question.
3. Only if option 4 is revisited: `/speckit.discovery.poc` on signature
   verification inside the packaged application, which interacts with the asar
   integrity fuses already recorded in `compatibility-discovery.md`.

No experiment is recommended for options 2 or 3. Their cost is well understood
and the blocker is a decision, not evidence.
