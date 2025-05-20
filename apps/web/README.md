Frontend web application for Gibsey, providing the main user interface.

### Output Modality

Pages can now be requested in different modalities (text, audio, or visual).
The `PageDisplay` component includes a new `ModalitySelector` dropdown that
allows choosing the desired output format. The selected modality is sent as an
`x-modality` header with each tRPC request (placeholder until backend support is
implemented).
