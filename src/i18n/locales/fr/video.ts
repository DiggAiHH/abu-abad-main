const video = {
  title: 'Séance vidéo',
  // ─── Connexion ───────────────────────────────────
  connectionEstablished: 'Connexion établie',
  connectionErrorDuringCall: "Erreur de connexion pendant l'appel",
  connectionLost: 'Connexion perdue',
  connectionError: 'Erreur de connexion',
  connectionInterrupted: 'Connexion interrompue, tentative de rétablissement...',
  connectionEndedInfo: 'Connexion terminée',
  connectionLostReconnect: 'Connexion perdue. Veuillez vous reconnecter.',
  connecting: 'Connexion en cours...',
  connected: 'Connecté',
  waitingForConnection: 'En attente de connexion...',
  live: 'En direct',

  // ─── Appel ───────────────────────────────────────
  callEnded: 'Appel terminé',
  callEndedSuccess: 'Appel terminé',
  callCouldNotStart: "L'appel n'a pas pu être démarré",
  callAlreadyOpen: 'Un appel est déjà en cours dans un autre onglet',
  endCall: "Terminer l'appel",
  errorAnsweringCall: "Erreur lors de la réponse à l'appel",
  errorStartingCall: "Erreur lors du démarrage de l'appel",
  errorInitializingCall: "Erreur lors de l'initialisation de l'appel",
  errorConnectingTherapist: 'Erreur lors de la connexion avec le thérapeute',
  connectionToTherapistFailed: 'La connexion avec le thérapeute a échoué',

  // ─── Pair/Réseau ─────────────────────────────────
  peerUnavailable:
    "L'interlocuteur n'est pas disponible. Veuillez attendre que le thérapeute se connecte.",
  peerServerUnreachable: 'Serveur PeerJS inaccessible. Échec de la connexion.',
  peerNotInitialized: 'Connexion pair non initialisée',
  serverError: 'Erreur serveur. Veuillez réessayer plus tard.',
  timeoutTherapist: 'Le thérapeute ne répond pas. Veuillez réessayer plus tard.',
  therapistNotOnline: "Le thérapeute n'est pas en ligne ou n'est pas joignable",
  slowNetwork: 'Connexion réseau lente détectée. Qualité réduite.',

  // ─── Média/Caméra ────────────────────────────────
  browserNoWebRTC: 'Le navigateur ne prend pas en charge WebRTC.',
  cameraAccessDenied:
    'Accès à la caméra/au microphone refusé. Veuillez vérifier les autorisations.',
  noDeviceFound: 'Aucune caméra ou microphone trouvé.',
  cameraTimeout: 'Délai de la caméra dépassé – mode audio uniquement utilisé',
  audioOnlyMode: 'Mode audio uniquement actif',
  audioOnlyActive: 'Mode audio uniquement actif (caméra non disponible)',
  videoOff: 'Désactiver la caméra',
  videoOn: 'Activer la caméra',
  micOff: 'Désactiver le microphone',
  micOn: 'Activer le microphone',
  cameraActiveAriaLabel: 'Caméra active',
  cameraMutedAriaLabel: 'Caméra désactivée',
  micActiveAriaLabel: 'Microphone actif',
  micMutedAriaLabel: 'Microphone coupé',

  // ─── Partage d'écran ─────────────────────────────
  screenShareStarted: "Partage d'écran démarré",
  screenShareFailed: "Échec du partage d'écran",
  screenShareEnded: "Partage d'écran terminé",
  stopScreenShare: "Arrêter le partage d'écran",
  startScreenShare: "Partager l'écran",

  // ─── Chat ────────────────────────────────────────
  openChat: 'Ouvrir le chat',

  // ─── Divers ──────────────────────────────────────
  participantConnectedNoVideo: 'Participant connecté (vidéo non disponible)',
  waitingForOtherParticipant: "En attente de l'autre participant...",
  otherParticipantLeft: "L'autre participant a quitté l'appel.",
  backToDashboard: 'Retour au tableau de bord',
  noRoomId: 'Aucun identifiant de salle disponible',

  // ─── Salle d'attente ─────────────────────────────
  waitingRoom: "Salle d'attente",
  waitingRoomPreparing: "Préparation de la salle d'attente...",
  waitingForTherapist: 'En attente du thérapeute',
  notifiedWhenReady: 'Vous serez notifié lorsque votre thérapeute sera prêt',
  therapistReady: 'Votre thérapeute est prêt !',
  redirectingToSession: 'Vous allez être redirigé vers la séance vidéo...',
  statusInWaitingRoom: "En salle d'attente",
  statusFillQuestionnaire: 'Remplir le questionnaire',
  statusTherapistCalling: 'Le thérapeute appelle',
  statusStartSession: 'Démarrer la séance vidéo',
  questionnaireSaved: 'Questionnaire enregistré',

  // ─── Questionnaire pré-séance ────────────────────
  currentMoodLabel: 'Comment est votre humeur actuelle ?',
  anxietyLevelLabel: "Niveau d'anxiété/de tension",
  sleepQualityLabel: 'Qualité du sommeil la nuit dernière',
  noAnxiety: 'Aucune anxiété',
  veryStrong: 'Très forte',
  medicationTakenToday: "Médicaments pris aujourd'hui",
  mainConcernsLabel: "Qu'aimeriez-vous aborder aujourd'hui ?",
  mainConcernsPlaceholder: "Vos sujets principaux pour la séance d'aujourd'hui...",
  questionsForTherapistLabel: 'Avez-vous des questions pour votre thérapeute ?',
  questionsPlaceholder: 'Questions que vous souhaitez poser...',
  significantEventsLabel: 'Événements importants depuis la dernière séance',
  eventsPlaceholder: 'Événements importants, changements...',
  submitQuestionnaire: 'Soumettre le questionnaire',

  // ─── File d'attente thérapeute ───────────────────
  queueTitle: "Aperçu de la salle d'attente",
  patientsWaiting: '{{count}} patient(s) en attente',
  noPatientsWaiting: 'Aucun patient en attente',
  patientsAppearHere:
    "Les nouveaux patients apparaîtront ici dès qu'ils rejoindront la salle d'attente.",
  appointment: 'Rendez-vous :',
  waitingTime: 'En attente : {{min}} min.',
  viewQuestionnaire: 'Questionnaire',
  admitPatient: 'Appeler',
  questionnaireFilled: 'Questionnaire rempli',
  questionnairePending: 'Questionnaire en attente',
  preSessionData: 'Données pré-séance',
  selectPatientToView: 'Sélectionnez un patient pour consulter son questionnaire.',
  moodLabel: 'Humeur',
  anxietyLabel: "Niveau d'anxiété",
  sleepLabel: 'Qualité du sommeil',
  medicationTakenLabel: 'Médicaments pris',
  mainConcerns: 'Préoccupations principales :',
  questionsForYou: 'Questions pour vous :',
  significantEvents: 'Événements importants :',
  questionnaireNotFilled: "Le questionnaire n'a pas encore été rempli.",
  patientCalledUp: 'Patient {{name}} appelé',
  errorLoadingQueueData: 'Erreur lors du chargement des données',
};

export default video;
