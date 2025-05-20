# The QDPI-92,160 Matrix: The Living Glyph Table

*Every move is a possible AI or narrative act in the Gibsey system.*

Below is the *generative matrix* for QDPI‑92,160—**every “cell” is a unique glyph/move/event**.

> **What's New in this Version:**
> Expanded with more expressive roles (now 6), alongside 10 actions and 6 modalities, resulting in 92,160 unique glyphs. This version aims to provide an even more comprehensive framework for a wide range of interactions.

---

## Axes & Possible Values

| Axis (Dimension) | Options (How Many) | Examples/Notes                                                                                                                                                         |
| :--------------- | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Action** | 10                 | Read, Index, Link, Prompt, React, Write, Save, Merge, Forget, Dream                                                                                                          |
| **Context** | 4                  | Page, Prompt/Query, Reaction/Draft, Generation                                                                                                                               |
| **State/Parity** | 4                  | Public, Private, Sacrifice/Cost, Gift                                                                                                                                  |
| **Role/Actor** | 6                  | Human, AI/Character, Guest, Mythic Guardian, Whole System, Part/System. *Guest:* temporary user with minimal persistence. *Mythic Guardian:* narrative moderator.       |
| **Relation** | 2                  | Subject→Object, Object→Subject (initiator/responder)                                                                                                                         |
| **Polarity** | 2                  | Internal (“n”, Princhetta) / External (“u”, Cop-E-Right)                                                                                                                     |
| **Rotation** | 4                  | N, E, S, W (0°, 90°, 180°, 270°)—perspective, sequencing, or “person”                                                                                                      |
| **Modality** | 6                  | Text, Audio, Video, AR, VR, Tactile                                                                                                                                    |

**$10 \times 4 \times 4 \times 6 \times 2 \times 2 \times 4 \times 6 = 92,160$**

---

## Sample Glyph Visualization (Placeholder)

*(Consider inserting a visual diagram or image of a sample glyph here. For example, a Princhetta/Cop-E-Right variant with the gates highlighted to illustrate the visual encoding.)*

**Example Markdown for an image (you would replace this with your actual image path):**
`![Sample Glyph](path_to_your_glyph_image.png "Sample QDPI Glyph")`

---

## Matrix Slice: From Abstract to Concrete

### 1. Action Layer (10)

|                  | Read     | Index    | Link     | Prompt     | React    | Write   | Save | Merge | Forget | Dream |
| :--------------- | :------- | :------- | :------- | :--------- | :------- | :------ | :--- | :---- | :----- | :---- |
| **Context** (4)  | Page     | Prompt   | Reaction | Generation | ...      | ...     | ...  | ...   | ...    | ...   |
| **State** (4)    | Public   | Private  | Sacrifice| Gift       | ...      | ...     | ...  | ...   | ...    | ...   |
| **Role** (6)     | Human    | AI       | Guest    | Mythic G.  | WholeSys | PartSys | ...  | ...   | ...    | ...   |
| **Relation** (2) | S→O      | O→S      |          |            | ...      | ...     | ...  | ...   | ...    | ...   |
| **Polarity** (2) | Internal | External |          |            | ...      | ...     | ...  | ...   | ...    | ...   |
| **Rotation** (4) | N        | E        | S        | W          | ...      | ...     | ...  | ...   | ...    | ...   |
| **Modality** (6) | Text     | Audio    | Video    | AR         | VR       | Tactile | ...  | ...   | ...    | ...   |

* **Link** connects pages/timelines; **Merge** combines Vault artifacts.
* Continue the grid for all combinations—**92,160 unique glyphs**.

---

### 2. Visual Encoding: Glyph Structure

* **Left gates (4):** *Who acts*—open/closed bits, which roles are “speaking”
* **Right gates (4):** *Who receives*—open/closed bits, who is “addressed”
* **Internal/External (“n”/“u”):** Symbol shape—Princhetta for internal, Cop-E-Right for external
* **Rotation:** N/E/S/W, sets role/perspective
* **Context/State:** Encoded as overlay or flag in UI/logic
* **Relation:** Direction of action (subject/object); each glyph is always a move in a sentence

---

### 3. Example Row ("Sentence")

| Action | Context    | State     | Role            | Relation | Polarity | Rotation | Modality | Glyph Meaning                                                                                             |
| :----- | :--------- | :-------- | :-------------- | :------- | :------- | :------- | :------- | :------------------------------------------------------------------------------------------------------ |
| Prompt | Page       | Gift      | AI              | S→O      | Internal | N        | Text     | "AI gives a prompt to the user, as a text gift, from self (Princhetta) in North orientation"            |
| Write  | Reaction   | Private   | Human           | O→S      | External | E        | Audio    | "Human writes a private audio reaction, receiving input, via Cop-E-Right, rotated East"                   |
| Forget | Generation | Public    | Part/Sys        | S→O      | Internal | W        | VR       | "A subsystem initiates forgetting, as a public VR event, internal state, rotated West"                    |
| Dream  | Prompt     | Sacrifice | Mythic Guardian | O→S      | External | S        | Video    | "The Mythic Guardian dreams in response to a prompt, sacrificing, producing a video externally, rotated S" |

---

### 4. Glyph Matrix Cell: How to Read

* **Action:** React
* **Context:** Reaction/Draft
* **State:** Public
* **Role:** Guest
* **Relation:** Subject→Object
* **Polarity:** External ("u"/Cop-E-Right)
* **Rotation:** 90° (East)
* **Modality:** Audio

> **Meaning:** "A Guest, acting as subject, externally reacts (as Cop-E-Right), drafting a public audio reply, facing East in the grammar."

---

### 5. Visualization

* Imagine as an **8D hypercube**—each axis a “slider” or “gate.”
* In a UI, “slide” axes or rotate glyph to select action/context/role.
* Each glyph is **addressable**, **renderable**, and **stateful**.

---

## Further Considerations & Technical Details

* **Minimal Encoding Size:** To uniquely address every one of the 92,160 glyphs, you will need 17 bits of information ($2^{16} = 65,536$; $2^{17} = 131,072$). This means implementations would typically use 3 bytes per glyph identifier if byte-aligned, or apply bit-packing.
* **Backwards Compatibility:** Any system or dataset previously designed for earlier iterations like QDPI-4096, QDPI-24576, or QDPI-61,440 can be considered a subset of this expanded QDPI-92,160 space. Glyphs from those systems can be mapped directly, ensuring continuity.
* **Future Expansion:** The matrix is designed to be extensible. If/when you decide to add new options to existing axes (e.g., new modalities, actions, or roles), or even new axes entirely, the total number of glyphs can be recalculated by multiplying the new number of options. For example, adding a 7th modality would change the calculation to $10 \times 4 \times 4 \times 6 \times 2 \times 2 \times 4 \times 7 = 107,520$ glyphs.

---

## Summary Table

| Axes           | Options                                                                                                                                                      |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Action** | 10: Read, Index, Link, Prompt, React, Write, Save, Merge, Forget, Dream                                                                                      |
| **Context** | 4: Page, Prompt/Query, Reaction/Draft, Generation                                                                                                              |
| **State** | 4: Public, Private, Sacrifice/Cost, Gift                                                                                                                       |
| **Role/Actor** | 6: Human, AI/Character, Guest, Mythic Guardian, Whole System, Part/System. *Guest:* temporary user. *Mythic Guardian:* narrative moderator.                 |
| **Relation** | 2: Subject→Object, Object→Subject                                                                                                                            |
| **Polarity** | 2: Internal (“n”/Princhetta), External (“u”/Cop-E-Right)                                                                                                       |
| **Rotation** | 4: N, E, S, W (0°, 90°, 180°, 270°)                                                                                                                            |
| **Modality** | 6: Text, Audio, Video, AR, VR, Tactile                                                                                                                         |

**$10 \times 4 \times 4 \times 6 \times 2 \times 2 \times 4 \times 6 = 92,160$**

---

**Every cell is a glyph. Every glyph is a move. Every move is a story, an action, a protocol event, a ritual, or a memory.**

**QDPI-92,160: The matrix is alive.**

