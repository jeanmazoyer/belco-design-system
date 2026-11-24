# Design System Hub — la source (paquet design-system-hub, Chakra UI 2.5.5)
Fichier : design-system-hub.md. Généré depuis le code source du DS reçu le 2026-11-24 : rien n’est interprété.

## Principe
- Le DS Hub est la référence : thème Chakra (foundations + 26 composants surchargés) et 53 composants React « Hub » (src/components).
- Orica importe ce thème et le surcharge : échelle primary → orica (10 tokens), police → CentraNo2 (fonts.body et fonts.heading ; le DS source déclare Open Sans et Oswald). Tout le reste (706 tokens) est identique. Orica ajoute 83 tokens métier absents du DS (statuteOffreAchat, planAchat, secondary, tracabilité…).
- Produire une interface = utiliser ces composants avec leurs props (variant, size, colorScheme). Ne jamais recopier le CSS Emotion : il est généré.

## Composants du thème (variantes · tailles · défaut)
- <Accordion> : variant module · défaut —
- <Alert> : variant subtle | left-accent | top-accent | solid | ai · size md | sm · défaut variant=subtle colorScheme=blue status=success size=md
- <Avatar> : variant solid | outlineLarge | outlineThin | border · size 2xs | xs | sm | md | lg | xl | 2xl | full · colorScheme dédiés gray | white · défaut size=md variant=solid colorScheme=primary
- <Badge> : variant solid | subtle | outline · défaut variant=solid colorScheme=primary
- <Button> : variant ghost | outline | solid | link | unstyled | clear | inverted · size lg | md | sm | xs · colorScheme dédiés dark | gray | darkGray | white | sand | lightGreen | darkGreen | kaki · défaut variant=solid size=md colorScheme=primary
- <Checkbox> : variant default | button · size sm | md | lg · colorScheme dédiés brand | sand | primary · défaut size=md colorScheme=primary variant=default
- <Container> : sans variante · défaut —
- <Drawer> : sans variante · size xs | sm | md | lg | xl | full | 2xl | 3xl · défaut size=xl placement=right
- <Form> : variant block | inline · défaut —
- <FormError> : sans variante · défaut —
- <FormLabel> : sans variante · size xs | sm · défaut size=sm
- <Heading> : sans variante · size 4xl | 3xl | 2xl | xl | lg | md | sm | xs · défaut size=xl
- <Input> : variant outline | filled | flushed | unstyled | base · size lg | md | sm | xs · colorScheme dédiés gray | white · défaut size=md variant=base colorScheme=white
- <Link> : sans variante · défaut —
- <Menu> : variant panel · défaut —
- <Modal> : sans variante · size xs | sm | md | lg | xl | 2xl | 3xl | 4xl | 5xl | 6xl | full · défaut size=md
- <Progress> : variant solid · size xs | sm | md | lg · colorScheme dédiés track · défaut size=md colorScheme=brand variant=solid
- <Radio> : variant default | button · size md | lg | sm · colorScheme dédiés brand | sand · défaut size=md colorScheme=primary variant=default
- <Select> : variant outline | filled | flushed | unstyled | border | text · size lg | md | sm | xs · colorScheme dédiés gray | white · défaut size=md variant=filled colorScheme=white
- <Slider> : sans variante · size lg | md | sm · défaut size=sm colorScheme=brand
- <Switch> : sans variante · size sm | md | lg · défaut size=sm colorScheme=primary
- <Table> : variant simple | striped | unstyled | card · size sm | md | lg · défaut variant=simple size=md colorScheme=gray
- <Tabs> : variant line | enclosed | enclosed-colored | soft-rounded | solid-rounded | unstyled | lineWithBg | plain | pills | segmented | buttons | checkCards · size sm | md | lg | xs · colorScheme dédiés brand · défaut size=md variant=line colorScheme=primary
- <Tag> : variant subtle | solid | outline | inverted | selected · size sm | md | lg | xs | xl · colorScheme dédiés gray | white | green | red | purple | orange | yellow · défaut size=md variant=solid colorScheme=brand
- <Textarea> : variant outline | flushed | filled | unstyled | base · size xs | sm | md | lg · défaut size=md variant=base colorScheme=white
- <Tooltip> : variant default | shadow · défaut variant=shadow

## Composants Hub avec story (rendus dans la doc)
- <ActionsGroup> : Story
- <AppsNav> : Story
- <AvatarUser> : Sizes, WithNameOnly, WithPhoto
- <CardGroup> : Story
- <ComponentSkeleton> : Composed, Default
- <CustomCircularProgress> : Story
- <DataTable> : ClickableLigne, Story
- <DateInput> : Default, Disabled, WithAllTypes
- <Dropzone> : Story
- <EllipsisText> : Story
- <EvolutionTag> : Story
- <FieldLinkTag> : Story
- <Filters> : Default, Overflow, Small, WithActions, WithLoading
- <HubIcon> : CustomIcons, Default
- <LocalePicker> : Button, Radio
- <Module> : Default, Skeleton, WithHeader, WithHeaderCollapsible, WithHeading, WithHeadingActions
- <MultiSelect> : Default, WithSelection
- <NumberInput> : Default
- <OrigineSelect> : Default
- <PeriodePicker> : Default
- <PhoneInput> : Default
- <ScrollBox> : Default
- <SearchInput> : Default, Pop
- <SegmentedControl> : AvecAccent, AvecLabels, Dark, Icons
- <Sidebar> : Client, ClientLoading, Default
- <SkeletonSimpleText> : Story
- <SkeletonTag> : Story
- <SoftRingProgress> : Default, Low, Mid
- <StickyAdaptatif> : Court, Long
- <TabWithCount> : Story
- <TagDisplayer> : Default
- <TangoTuto> : Story
- <TimeInput> : Default
- <TooltipBtn> : Story
- <notes> : AllTypes, IconOnly, WithLabel, FermeeEffectuee, Ouverte

## Composants Hub sans story (non rendus ; la plupart dépendent de l’API Belco)
ButtonBI, CustomSelect, EventTimeline, FreshworksWidget, Frise, InputTextWithGoogleAutocomplete, InputWithResults, Kanban, ListeDependances, MobileNavbar, ModalCallContacts, PowerBiReportsMenu, RichTextBaiaInput, RichTextInput, SearchPicker, SpeechBtn, UserMenuBanner, documents

## Règles
- Avant d’écrire un composant, vérifier qu’il n’existe pas dans cette liste ; s’il existe, utiliser ses variantes plutôt que des props de style.
- Les dégradés des boutons et badges viennent de scaleGradient(colorScheme) : 135deg, {scale}.600 → {scale}.400 (hover 700 → 500). Ne pas les réécrire.
- Un composant « hors DS » dans l’audit (carte KPI, pagination, état vide, rail) est composé dans Orica : candidat à une entrée dans le DS plutôt qu’à être copié.
