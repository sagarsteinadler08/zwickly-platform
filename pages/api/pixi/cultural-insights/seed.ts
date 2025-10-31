import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const culturalData = [
  // ==========================================
  // SECTION 1: UNIVERSITY STRUCTURE
  // ==========================================
  {
    category: 'university',
    title: 'WHZ Faculties and Departments',
    content: 'West Saxon University of Zwickau has 8 faculties: 1) Electrical Engineering, 2) Automotive Engineering, 3) Mechanical Engineering, 4) Physical Engineering/Computer Science, 5) Economics, 6) Applied Languages, 7) Applied Arts, 8) Health & Social Sciences. Each faculty has dedicated professors and research labs.',
    tags: ['faculties', 'departments', 'whz', 'structure', 'engineering'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'Programs Offered at WHZ',
    content: 'WHZ offers Bachelor and Master programs in: Automotive Engineering (EN/DE, 7 semesters Bachelor, 3 semesters Master), Electrical Engineering, Data Science, Business Administration, Applied Languages. Most engineering programs start in winter semester (October).',
    tags: ['programs', 'courses', 'bachelor', 'master', 'automotive', 'engineering'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'ECTS and Module System',
    content: 'Each module is worth 5-6 ECTS credits. You need 30 ECTS per semester to stay on track. Typical Bachelor = 210 ECTS (7 semesters), Master = 90 ECTS (3 semesters). Exams are either written (90-120min) or oral (20-30min).',
    tags: ['ects', 'modules', 'credits', 'grading', 'exams'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'German Grading System',
    content: 'German grades: 1.0 = excellent (best), 2.0 = good, 3.0 = satisfactory, 4.0 = sufficient (pass), 5.0 = fail. You have TWO attempts per exam. Third attempt requires special approval and is your last chance.',
    tags: ['grading', 'grades', 'exams', 'retake', 'assessment'],
    region: 'Germany',
  },
  {
    category: 'university',
    title: 'Semester Timeline at WHZ',
    content: 'Winter Semester (WS): October 1 - March 31 (exam period: Feb-Mar). Summer Semester (SS): April 1 - September 30 (exam period: Jul-Aug). Re-registration deadline is usually 4 weeks before semester starts.',
    tags: ['semester', 'timeline', 'deadlines', 'registration', 'exams'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'WHZ Library and Resources',
    content: 'Library located at Kornmarkt campus. Open Mon-Fri 8:00-18:00. Use OPAC online catalog for book search. Borrow up to 10 books for 4 weeks. Digital resources include SpringerLink, IEEE Xplore. VPN required for off-campus access.',
    tags: ['library', 'books', 'resources', 'opac', 'research'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'Online Portals (Selma, OPAL, Moodle)',
    content: 'Essential portals: SELMA (exam registration, grades, certificates), OPAL (course materials, assignments, communication), HIS (student information system). Login with university credentials (student ID + password).',
    tags: ['selma', 'opal', 'moodle', 'portals', 'online-learning'],
    region: 'Zwickau',
  },
  {
    category: 'university',
    title: 'IT Services and WiFi',
    content: 'University email: firstname.lastname@fh-zwickau.de. WiFi: eduroam (use university credentials). VPN: Required for accessing library databases from home. IT Support at Rechenzentrum, Room 2.10.',
    tags: ['email', 'wifi', 'eduroam', 'vpn', 'it-support'],
    region: 'Zwickau',
  },
  {
    category: 'academic',
    title: 'Engineering & Academic Courses',
    content: 'WHZ offers comprehensive engineering programs including: Risk Management, Project Management, Quality Management, Automotive Engineering, Electrical Engineering, Data Science, Machine Learning. Most courses require ECTS credits. Check OPAL for course materials and SELMA for exam registration.',
    tags: ['risk', 'management', 'engineering', 'academic', 'courses', 'project', 'quality', 'automotive', 'electrical', 'data-science'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 2: STUDENT SUPPORT SERVICES
  // ==========================================
  {
    category: 'support',
    title: 'International Office (Akademisches Auslandsamt)',
    content: 'Located at Kornmarkt 1, Room 1.17. Handles: visa extensions, residence permits, international student integration. Email: international@fh-zwickau.de. Office hours: Mon-Thu 9:00-15:00, Fri 9:00-12:00.',
    tags: ['international-office', 'visa', 'support', 'contact', 'help'],
    region: 'Zwickau',
  },
  {
    category: 'support',
    title: 'Student Secretariat',
    content: 'For enrollment, leave of absence, semester documents, certificates. Located at Kornmarkt 1. Bring your student ID for all requests. Certificate processing takes 3-5 business days.',
    tags: ['enrollment', 'certificates', 'secretariat', 'documents'],
    region: 'Zwickau',
  },
  {
    category: 'support',
    title: 'Examination Office (Prüfungsamt)',
    content: 'Each faculty has its own Prüfungsamt. They handle: exam registration, grade appeals, exam scheduling. Contact your faculty\'s Prüfungsamt for specific questions. Check SELMA for exam dates.',
    tags: ['prüfungsamt', 'exams', 'grades', 'appeals'],
    region: 'Zwickau',
  },
  {
    category: 'support',
    title: 'Studentenwerk Services',
    content: 'Studentenwerk Chemnitz-Zwickau provides: Dormitories (€180-300/month), Mensa (cafeteria), BAföG counseling, psychological support (free sessions), childcare. Office: Äußere Schneeberger Str. 20.',
    tags: ['studentenwerk', 'housing', 'mensa', 'counseling', 'bafög'],
    region: 'Zwickau',
  },
  {
    category: 'support',
    title: 'Buddy Program for Internationals',
    content: 'International Office runs a buddy program pairing new international students with experienced students. Sign up during orientation week. Buddies help with: city orientation, bureaucracy, social integration.',
    tags: ['buddy', 'mentor', 'orientation', 'integration', 'friends'],
    region: 'Zwickau',
  },
  {
    category: 'support',
    title: 'Free Psychological Counseling',
    content: 'Studentenwerk offers FREE confidential counseling for: exam stress, homesickness, depression, anxiety. Book appointments via email or phone. No referral needed. Completely confidential.',
    tags: ['counseling', 'mental-health', 'stress', 'support', 'free'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 3: TECHNICAL CLUBS AT WHZ
  // ==========================================
  {
    category: 'clubs',
    title: 'WHZ Racing Team (Formula Student)',
    content: 'Student team designing and building electric race cars for Formula Student competitions. Open to all students. Departments: Chassis, Powertrain, Electronics, Marketing. Meetings: Every Wednesday 18:00 at Workshop Building. Contact: racing-team@fh-zwickau.de',
    tags: ['formula-student', 'racing', 'automotive', 'electric-vehicle', 'competition'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'RoboZwickau Robotics Team',
    content: 'Robotics and AI research team competing in European RoboCup and similar contests. Projects: Autonomous robots, machine vision, Arduino/Raspberry Pi. Weekly workshops on Thursdays 17:00. Great for hands-on learning!',
    tags: ['robotics', 'ai', 'arduino', 'competitions', 'machine-learning'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'WHZ AI & Data Science Club',
    content: 'Student-run club for AI enthusiasts. Activities: Kaggle competitions, ML workshops, Python coding sessions, guest lectures from industry. Meetings: Tuesdays 18:30 at Lab E3.15. All skill levels welcome!',
    tags: ['ai', 'data-science', 'machine-learning', 'python', 'kaggle'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'WHZ GreenTech Lab',
    content: 'Student innovation group focused on sustainable engineering: solar panels, electric mobility, energy efficiency projects. Collaborates with industry partners. Open lab sessions: Fridays 14:00. Join to work on real sustainability projects!',
    tags: ['sustainability', 'green-tech', 'solar', 'environment', 'innovation'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'Coding Circle',
    content: 'Peer coding group meeting weekly for collaborative programming. Topics: Web dev (React, Node.js), App development, GitHub workflows, hackathons. Beginner-friendly. Meets: Mondays 19:00 at Library Study Room. Bring your laptop!',
    tags: ['coding', 'programming', 'web-dev', 'github', 'collaboration'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'WHZ eSports Club',
    content: 'Gaming and esports community at WHZ. Games: League of Legends, CS:GO, FIFA. Participate in university tournaments. Social gaming nights every Friday. Discord server for communication. Great way to relax and make friends!',
    tags: ['esports', 'gaming', 'social', 'tournaments', 'community'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'AeroZwickau Drone Design',
    content: 'Club focused on drone design, aerodynamics, and control systems. Projects include: 3D-printed drones, autonomous flight, FPV racing. Workshop access for members. Meetings: Wednesdays 16:00.',
    tags: ['drones', 'aerodynamics', '3d-printing', 'flight', 'engineering'],
    region: 'Zwickau',
  },
  {
    category: 'clubs',
    title: 'Autonomous Vehicle Lab',
    content: 'Research group working on self-driving car technology. Topics: ROS (Robot Operating System), sensor fusion, perception algorithms, ADAS. Open to Master students and interested Bachelors. Contact Prof. Böhnstedt for access.',
    tags: ['autonomous-vehicles', 'self-driving', 'ros', 'adas', 'research'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 4: STUDENT CULTURE & ASSOCIATIONS
  // ==========================================
  {
    category: 'student-life',
    title: 'Student Council (StuRa)',
    content: 'StuRa represents student interests and organizes campus events: semester parties, film nights, BBQs, cultural festivals. They also provide feedback to university administration. Office: Student House (Studentenhaus). Open to all students!',
    tags: ['stura', 'student-council', 'events', 'parties', 'representation'],
    region: 'Zwickau',
  },
  {
    category: 'student-life',
    title: 'International Student Club',
    content: 'Weekly cultural exchange nights with food from different countries, city tours, weekend trips to Dresden/Leipzig/Prague. Join WhatsApp group during orientation. Meetings: Fridays 18:00 at International Lounge.',
    tags: ['international', 'culture', 'exchange', 'trips', 'friends'],
    region: 'Zwickau',
  },
  {
    category: 'student-life',
    title: 'Music & Arts Club',
    content: 'Open mic sessions every 2nd Thursday, art exhibitions, poetry nights, jam sessions. No professional skills needed - it\'s about having fun! Performances held at Studentenhaus. Instagram: @whz.arts',
    tags: ['music', 'arts', 'creativity', 'open-mic', 'community'],
    region: 'Zwickau',
  },
  {
    category: 'student-life',
    title: 'Hochschulsport (University Sports)',
    content: 'Semester membership €15-30. Offers: Football, Basketball, Volleyball, Yoga, Fitness, Swimming, Climbing. Register via Hochschulsport website. Great way to stay fit and meet people! Popular: Monday Yoga, Wednesday Football.',
    tags: ['sports', 'fitness', 'football', 'yoga', 'health'],
    region: 'Zwickau',
  },
  {
    category: 'student-life',
    title: 'Film Club Zwickau',
    content: 'Weekly movie screenings (often in English with German subtitles) followed by discussions. Good for language practice and socializing. Every Tuesday 20:00 at Campus Cinema (Room A1.02). Entry free for students!',
    tags: ['film', 'movies', 'cinema', 'language', 'social'],
    region: 'Zwickau',
  },
  {
    category: 'student-life',
    title: 'Green Campus Initiative',
    content: 'Student-led sustainability movement: zero-waste campaigns, recycling education, tree planting, bike repair workshops. Weekly meetings: Thursdays 17:00. Join to make WHZ greener and meet eco-conscious students!',
    tags: ['sustainability', 'environment', 'green', 'volunteering', 'eco'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 5: CAREER & INDUSTRY
  // ==========================================
  {
    category: 'career',
    title: 'WHZ Career Center',
    content: 'Offers: CV/resume workshops, company visits, job postings, interview preparation. Annual Career Week in May with BMW, VW, Bosch booths. Book 1-on-1 career counseling via OPAL. Free for all students!',
    tags: ['career', 'jobs', 'cv', 'interview', 'workshop'],
    region: 'Zwickau',
  },
  {
    category: 'career',
    title: 'Mandatory Internships (Praktikum)',
    content: 'Most engineering programs require a practical semester (Praxissemester) - usually 6th semester for Bachelor. Duration: 20-26 weeks. WHZ helps find placements at partner companies. Start searching 6 months in advance!',
    tags: ['internship', 'praktikum', 'praxissemester', 'industry', 'experience'],
    region: 'Zwickau',
  },
  {
    category: 'career',
    title: 'Industry Partnerships',
    content: 'WHZ has strong partnerships with: BMW, Volkswagen, Audi, Bosch, Continental, Porsche. Benefits: Guest lectures, lab sponsorships, internship opportunities, thesis topics. Automotive Lab sponsored by Audi.',
    tags: ['partnerships', 'industry', 'bmw', 'vw', 'automotive', 'internship'],
    region: 'Zwickau',
  },
  {
    category: 'career',
    title: 'Startup Support (SAXEED)',
    content: 'SAXEED Gründungsinitiative helps students start businesses. Services: Business plan workshops, funding consultation, mentor matching, co-working space. Multiple startups have launched from WHZ! Contact: gruendung@fh-zwickau.de',
    tags: ['startup', 'entrepreneurship', 'saxeed', 'funding', 'innovation'],
    region: 'Saxony',
  },
  {
    category: 'career',
    title: 'Alumni Network and LinkedIn',
    content: 'WHZ Alumni Association hosts networking events twice per year. Join LinkedIn WHZ group for job postings and mentorship. Many alumni work at Audi, Porsche, Siemens, and tech companies across Germany.',
    tags: ['alumni', 'networking', 'linkedin', 'mentorship', 'jobs'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 6: CAMPUS & LOCAL LIFE
  // ==========================================
  {
    category: 'campus-life',
    title: 'WHZ Dormitories',
    content: 'Three main dorms: 1) Schneeberger Straße (€250-300/month, 10min to campus), 2) Peter-Breuer-Straße (€200-280/month, 15min), 3) Äußere Dresdner Straße (€220-290/month, 20min bus). All include internet. Apply via Studentenwerk 3-4 months in advance!',
    tags: ['dorms', 'housing', 'accommodation', 'rent', 'studentenwerk'],
    region: 'Zwickau',
  },
  {
    category: 'campus-life',
    title: 'Mensa (University Cafeteria)',
    content: 'Mensa Zwickau at Äußere Schneeberger Str. 20. Open 11:00-14:00 Mon-Fri. Daily menu: 2 meat options, 1 vegetarian, 1 vegan. Meal costs: €2.50-4.50 with student card. Pay with Chipkarte or cash.',
    tags: ['mensa', 'cafeteria', 'food', 'lunch', 'campus'],
    region: 'Zwickau',
  },
  {
    category: 'campus-life',
    title: 'Student Semester Ticket',
    content: 'Included in semester fee (~€120). Covers: All VMS buses/trams in Zwickau, regional trains to Chemnitz/Leipzig/Dresden. Valid 6 months. Show student card to ticket inspectors. Huge money saver!',
    tags: ['semester-ticket', 'transport', 'vms', 'train', 'bus'],
    region: 'Zwickau',
  },
  {
    category: 'campus-life',
    title: 'Healthcare Near Campus',
    content: 'Nearest doctor: Hausarzt Praxis Dr. Schmidt (Äußere Schneeberger Str). Dentist: Zahnarzt Zwickau Zentrum. Emergency: Helios Klinik Zwickau (24/7). Pharmacy: Apotheke am Kornmarkt (check Notdienst for night service).',
    tags: ['healthcare', 'doctor', 'dentist', 'hospital', 'pharmacy'],
    region: 'Zwickau',
  },
  {
    category: 'campus-life',
    title: 'Shopping Essentials in Zwickau',
    content: 'Supermarkets near campus: REWE (Äußere Schneeberger Str), Kaufland (15min bus), Aldi/Lidl (budget-friendly). Pharmacy: DM Drogerie. Bank: Sparkasse Zwickau (ATM at Kornmarkt). Post: Deutsche Post at Hauptbahnhof.',
    tags: ['shopping', 'supermarket', 'rewe', 'pharmacy', 'bank'],
    region: 'Zwickau',
  },
  {
    category: 'campus-life',
    title: 'Weekend Travel from Zwickau',
    content: 'Easy day trips: Dresden (1h train), Leipzig (1.5h), Chemnitz (30min), Prague (3h). Erzgebirge mountains (skiing/hiking, 45min). Use semester ticket for free regional travel. Book hostels early for weekend trips!',
    tags: ['travel', 'weekend', 'dresden', 'leipzig', 'prague', 'trips'],
    region: 'Saxony',
  },
  {
    category: 'campus-life',
    title: 'Printing and Copy Services',
    content: 'Print stations in Library and Faculty buildings. Cost: €0.10/page (black), €0.50/page (color). Top up Chipkarte at terminals. Scan documents for free. Printing limits: 200 pages/semester.',
    tags: ['printing', 'copying', 'campus', 'chipkarte', 'documents'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 7: ACADEMIC TOOLS
  // ==========================================
  {
    category: 'tools',
    title: 'OPAL Learning Platform',
    content: 'OPAL is THE main platform for course materials. Access: bildungsportal.sachsen.de/opal. Use university credentials. Features: Lecture slides, assignments, forums, submission deadlines, group work spaces. Check daily for updates!',
    tags: ['opal', 'learning', 'platform', 'materials', 'online'],
    region: 'Saxony',
  },
  {
    category: 'tools',
    title: 'SELMA Exam Registration',
    content: 'SELMA is critical for: Exam registration (closes 4 weeks before exam!), viewing grades, downloading certificates, checking credit points. Late registration = no exam attempt. Check SELMA weekly!',
    tags: ['selma', 'exams', 'registration', 'grades', 'important'],
    region: 'Zwickau',
  },
  {
    category: 'tools',
    title: 'VPN for Library Access',
    content: 'VPN required to access SpringerLink, IEEE, research papers from home. Download: Cisco AnyConnect. Setup guide on WHZ IT website. Connect to vpn.fh-zwickau.de. Essential for thesis research!',
    tags: ['vpn', 'library', 'research', 'papers', 'remote-access'],
    region: 'Zwickau',
  },
  {
    category: 'tools',
    title: 'University Email (Outlook)',
    content: 'Your WHZ email: firstname.lastname@fh-zwickau.de. Check DAILY - professors send important updates here. Access via: Outlook Web, mobile app, or desktop. Set up forwarding to personal email if preferred.',
    tags: ['email', 'outlook', 'communication', 'professors'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 8: ONBOARDING & ORIENTATION
  // ==========================================
  {
    category: 'onboarding',
    title: 'Enrollment Checklist',
    content: 'Required documents: 1) Passport, 2) Admission letter, 3) Health insurance proof, 4) Bank statement/blocked account, 5) Passport photos (2x), 6) Completed enrollment form. Submit to Student Secretariat during enrollment week.',
    tags: ['enrollment', 'documents', 'checklist', 'admission', 'requirements'],
    region: 'Zwickau',
  },
  {
    category: 'onboarding',
    title: 'Orientation Week Schedule',
    content: 'First week includes: Campus tour (Monday), Library introduction (Tuesday), IT services setup (Wednesday), Faculty welcome (Thursday), City tour + Buddy matching (Friday). Attendance highly recommended - you\'ll get critical info!',
    tags: ['orientation', 'first-week', 'welcome', 'schedule', 'campus-tour'],
    region: 'Zwickau',
  },
  {
    category: 'onboarding',
    title: 'Essential Apps for Students',
    content: 'Must-have apps: 1) DB Navigator (train schedules), 2) VMS (local bus/tram), 3) OPAL mobile, 4) DeepL/Google Translate, 5) Duolingo (German practice), 6) TooGoodToGo (cheap food), 7) N26/Revolut (banking).',
    tags: ['apps', 'mobile', 'tools', 'essentials', 'technology'],
    region: 'Germany',
  },
  {
    category: 'onboarding',
    title: 'Emergency Contact Numbers',
    content: 'Save these: 112 (Fire/Ambulance - EMERGENCY), 110 (Police), 116117 (Medical on-call, non-emergency), WHZ Security: +49 375 536-0, International Office: +49 375 536-1042. Program them in your phone immediately!',
    tags: ['emergency', 'safety', '112', 'contacts', 'important'],
    region: 'Germany',
  },
  {
    category: 'onboarding',
    title: 'Student WhatsApp Groups',
    content: 'Each program/batch has WhatsApp groups for announcements, study groups, event planning. Ask your buddy or International Office for invite links. Great for quick questions and making friends. Keep notifications on for important updates!',
    tags: ['whatsapp', 'groups', 'communication', 'social', 'networking'],
    region: 'Zwickau',
  },

  // ==========================================
  // SECTION 9: ORIGINAL GERMAN CULTURE DATA
  // ==========================================
  // German Traditions
  {
    category: 'tradition',
    title: 'Punctuality and Time Management',
    content: 'Germans value being on time extremely seriously. Arriving even 5 minutes late without prior notice is considered disrespectful. This reflects the efficiency culture and respect for others\' time. If you\'re running late, always call or message ahead.',
    tags: ['punctuality', 'time', 'culture', 'etiquette', 'respect'],
    region: 'Germany',
  },
  {
    category: 'tradition',
    title: 'Direct Communication Style',
    content: 'Germans communicate directly and honestly, even when giving criticism. This is NOT considered rude - it\'s valued as clarity and efficiency. What might seem blunt in high-context cultures is simply straightforward communication in Germany.',
    tags: ['communication', 'directness', 'culture', 'honesty'],
    region: 'Germany',
  },
  {
    category: 'tradition',
    title: 'Work-Life Balance and Sunday Rest',
    content: 'Germans protect private time fiercely. Shops close early (6-8 PM), and Sundays are strictly for rest ("Sonntagsruhe"). On Sundays, loud activities, work, and shopping are prohibited by law. This is taken very seriously.',
    tags: ['sunday', 'rest', 'work-life-balance', 'shops', 'quiet'],
    region: 'Germany',
  },
  {
    category: 'tradition',
    title: 'Personal Space and Privacy',
    content: 'Germans maintain approximately 1.5 meters distance during conversations. Avoid intrusive personal questions early in relationships. Topics like salary, religion, or family details are considered private until you know someone well.',
    tags: ['personal-space', 'privacy', 'boundaries', 'etiquette'],
    region: 'Germany',
  },
  {
    category: 'tradition',
    title: 'Environmental Awareness and Recycling',
    content: 'Waste separation is strict and a source of national pride. Use Yellow bin for plastic/packaging, Blue for paper, Brown for organic waste, and Black for residual waste. Improper disposal can result in fines.',
    tags: ['environment', 'recycling', 'waste', 'sustainability'],
    region: 'Germany',
  },
  {
    category: 'tradition',
    title: 'Cash Usage in Daily Life',
    content: 'Despite being a developed economy, cash is still widely used, especially in small towns and local businesses. Not all places accept cards. Always keep small coins and €5-20 bills ready.',
    tags: ['payment', 'cash', 'money', 'shopping'],
    region: 'Saxony',
  },
  {
    category: 'tradition',
    title: 'Seasonal Traditions and Festivals',
    content: 'Major cultural events include: Weihnachtsmarkt (Christmas markets - Nov-Dec), Karneval (Carnival - Feb/Mar), Oktoberfest (Sept-Oct), and Maipole festivals (May 1st). These reflect communal life and regional identity.',
    tags: ['festivals', 'christmas', 'carnival', 'celebrations', 'community'],
    region: 'Saxony',
  },

  // Bureaucracy
  {
    category: 'bureaucracy',
    title: 'City Registration (Anmeldung)',
    content: 'MANDATORY: Register your address within 14 days of moving in at the Bürgerbüro (Citizens Office). You MUST bring "Wohnungsgeberbestätigung" (landlord confirmation). This is required for everything else: bank account, residence permit, etc.',
    tags: ['anmeldung', 'registration', 'bureaucracy', 'address', 'mandatory'],
    region: 'Saxony',
  },
  {
    category: 'bureaucracy',
    title: 'Residence Permit (Aufenthaltstitel)',
    content: 'Required for non-EU students to stay beyond 90 days. Apply at Ausländerbehörde (Foreigners Office). Required documents: passport, health insurance proof, financial proof (~€11,208/year or blocked account), university enrollment certificate.',
    tags: ['visa', 'residence-permit', 'aufenthaltstitel', 'non-eu', 'immigration'],
    region: 'Germany',
  },
  {
    category: 'bureaucracy',
    title: 'Health Insurance (Krankenversicherung)',
    content: 'MANDATORY for all students. Options: Public (TK, AOK, Barmer - ~€110/month) or Private (Mawista, Care Concept - cheaper but limited coverage). Proof required before university enrollment.',
    tags: ['health-insurance', 'krankenversicherung', 'mandatory', 'tk', 'aok'],
    region: 'Germany',
  },
  {
    category: 'bureaucracy',
    title: 'Bank Account (Girokonto)',
    content: 'Essential for blocked account, rent payments, mobile contracts. Popular banks: N26 (online, easy for internationals), Deutsche Bank, Commerzbank, Sparkasse. Bring passport, Anmeldung, and student ID.',
    tags: ['bank', 'account', 'finance', 'n26', 'blocked-account'],
    region: 'Germany',
  },
  {
    category: 'bureaucracy',
    title: 'TV Tax (Rundfunkbeitrag)',
    content: 'Monthly broadcasting tax of €18.36 per household (NOT per person). Required even if you don\'t own a TV. Automatically charged - register online after moving in.',
    tags: ['tv-tax', 'rundfunkbeitrag', 'fees', 'household'],
    region: 'Germany',
  },
  {
    category: 'bureaucracy',
    title: 'Residence Certificate (Meldebescheinigung)',
    content: 'Issued by Bürgerbüro after Anmeldung. Needed for: bank account, phone contract, university enrollment, residence permit. Keep multiple copies!',
    tags: ['meldebescheinigung', 'certificate', 'documents', 'bureaucracy'],
    region: 'Germany',
  },
  {
    category: 'bureaucracy',
    title: 'Student Work Permits',
    content: 'Non-EU students can work up to 120 full days or 240 half days per year. Working ≤20 hours/week is tax-free. Need Tax ID (Steuer-ID) from Finanzamt.',
    tags: ['work', 'job', 'student-work', 'tax-id', 'permit'],
    region: 'Germany',
  },

  // Education
  {
    category: 'education',
    title: 'Universities in Saxony',
    content: 'Major universities: TU Dresden (research), HTWK Leipzig (applied sciences), WHZ Zwickau (engineering, automotive), University of Leipzig (humanities). Strong in engineering, technology, and research.',
    tags: ['university', 'whz', 'tu-dresden', 'leipzig', 'education'],
    region: 'Saxony',
  },
  {
    category: 'education',
    title: 'Semester System',
    content: 'Winter Semester: October-March (exams in Feb/Mar). Summer Semester: April-September (exams in Jul/Aug). Each semester = 6 months.',
    tags: ['semester', 'academic-calendar', 'exams', 'university'],
    region: 'Germany',
  },
  {
    category: 'education',
    title: 'ECTS Credit System',
    content: 'Courses typically worth 5-6 ECTS credits. Need 30 ECTS per semester to graduate on time. 180 ECTS for Bachelor (3 years), 120 for Master (2 years). European academic standard.',
    tags: ['ects', 'credits', 'grading', 'study'],
    region: 'Germany',
  },
  {
    category: 'education',
    title: 'Student Card and Benefits',
    content: 'Studentenausweis (student card) provides: free/discounted public transport (Semester ticket), library access, cafeteria discounts, gym membership. At WHZ: "Chipkarte" also used for building access.',
    tags: ['student-card', 'benefits', 'discounts', 'transport'],
    region: 'Saxony',
  },
  {
    category: 'education',
    title: 'Student Union (Studentenwerk)',
    content: 'Studentenwerk Chemnitz-Zwickau offers: student housing (dorms), canteens, psychological counseling, financial aid (BAföG), international student support. Contact for accommodation help.',
    tags: ['studentenwerk', 'housing', 'support', 'counseling'],
    region: 'Saxony',
  },
  {
    category: 'education',
    title: 'Academic Independence',
    content: 'German universities expect self-discipline and independence. Attendance not always mandatory (except labs/seminars). Emphasis on "Selbststudium" (self-study). Plagiarism taken extremely seriously.',
    tags: ['study', 'independence', 'self-study', 'academic-culture'],
    region: 'Germany',
  },

  // Integration
  {
    category: 'integration',
    title: 'Making German Friends',
    content: 'Best ways to integrate: Join local clubs (Vereine), attend university events, join language tandems, participate in sports clubs. Germans are reserved initially but friendships become deep and loyal over time.',
    tags: ['friends', 'integration', 'social', 'clubs', 'tandem'],
    region: 'Saxony',
  },
  {
    category: 'integration',
    title: 'Community Etiquette',
    content: 'Always greet with "Hallo" or "Guten Tag" when entering rooms, offices, or elevators. Say "Tschüss" or "Auf Wiedersehen" when leaving. Small but important gestures of respect.',
    tags: ['greetings', 'etiquette', 'manners', 'culture'],
    region: 'Germany',
  },
  {
    category: 'integration',
    title: 'Quiet Hours (Ruhezeiten)',
    content: 'Strict quiet hours: 10 PM - 7 AM on weekdays, ALL DAY Sunday. No loud music, drilling, parties, or vacuum cleaning. Neighbors will complain, and landlords can issue warnings.',
    tags: ['quiet-hours', 'ruhezeiten', 'noise', 'rules', 'sunday'],
    region: 'Germany',
  },
  {
    category: 'integration',
    title: 'Healthcare Access',
    content: 'Emergencies: call 112 (ambulance/fire). Medical on-call: 116117. Find doctors via: Jameda.de or your insurance app. Pharmacies (Apotheke) have night shifts - check "Notdienst" schedule.',
    tags: ['healthcare', 'emergency', 'doctor', 'pharmacy', '112'],
    region: 'Germany',
  },
  {
    category: 'integration',
    title: 'Cost of Living in Saxony',
    content: 'Typical student budget: €700-950/month including rent (€250-400), food (€200), insurance (€110), transport (included in semester fee), misc (€150). Saxony is one of the most affordable German states.',
    tags: ['cost-of-living', 'budget', 'expenses', 'affordable'],
    region: 'Saxony',
  },
  {
    category: 'integration',
    title: 'Cultural Shock Phases',
    content: 'Normal adaptation phases: 1) Excitement (honeymoon), 2) Frustration (culture shock), 3) Adaptation (adjustment), 4) Integration (feeling at home). Takes 6-12 months. Completely normal!',
    tags: ['culture-shock', 'adaptation', 'mental-health', 'integration'],
    region: 'Germany',
  },

  // Language
  {
    category: 'language',
    title: 'German Language Requirements',
    content: 'B1-B2 German proficiency usually required for German-taught programs. English-taught programs available but learning German helps with integration and daily life. Free courses: Volkshochschule (VHS), university language centers.',
    tags: ['german', 'language', 'b1', 'b2', 'courses'],
    region: 'Germany',
  },
  {
    category: 'language',
    title: 'Saxon Dialect (Sächsisch)',
    content: 'Saxony has a distinct accent with soft consonants and melodic intonation. May differ significantly from textbook German. Don\'t worry - most people can also speak High German (Hochdeutsch).',
    tags: ['dialect', 'sächsisch', 'accent', 'saxon'],
    region: 'Saxony',
  },
  {
    category: 'language',
    title: 'Formal vs Informal German (Sie vs Du)',
    content: 'Use "Sie" (formal) with: professors, administration staff, strangers, elderly people, authority figures. Use "du" (informal) with: fellow students, friends, children. When in doubt, use "Sie" and wait for them to suggest "du".',
    tags: ['sie', 'du', 'formal', 'informal', 'etiquette'],
    region: 'Germany',
  },
  {
    category: 'language',
    title: 'Essential German Phrases',
    content: 'Must-know phrases: "Guten Tag" (Hello), "Tschüss" (Bye), "Entschuldigung" (Sorry/Excuse me), "Kein Problem" (No problem), "Alles klar?" (Everything okay?), "Ich verstehe nicht" (I don\'t understand), "Sprechen Sie Englisch?" (Do you speak English?).',
    tags: ['phrases', 'basics', 'communication', 'survival-german'],
    region: 'Germany',
  },
  {
    category: 'language',
    title: 'Email Etiquette for University',
    content: 'Always include: Formal greeting ("Sehr geehrte/r Herr/Frau [Name]"), your student ID, clear subject line, polite closing ("Mit freundlichen Grüßen"). Professors expect formal communication even via email.',
    tags: ['email', 'communication', 'professors', 'formal'],
    region: 'Germany',
  },

  // Events & Culture
  {
    category: 'events',
    title: 'Weihnachtsmarkt (Christmas Markets)',
    content: 'Famous Christmas markets run from late November to December. Dresden\'s Striezelmarkt is one of Germany\'s oldest. Enjoy Glühwein (mulled wine), Bratwurst, handmade crafts, and festive atmosphere.',
    tags: ['christmas', 'weihnachtsmarkt', 'glühwein', 'dresden', 'winter'],
    region: 'Saxony',
  },
  {
    category: 'events',
    title: 'German Reunification Day',
    content: 'October 3rd is a national holiday celebrating German unity (1990). Saxony played a key role in the peaceful revolution. Public offices, shops, and universities closed.',
    tags: ['holiday', 'reunification', 'october-3', 'history'],
    region: 'Germany',
  },
  {
    category: 'events',
    title: 'Maibaumfest (Maypole Festival)',
    content: 'May 1st celebration where communities raise a decorated tree pole to celebrate spring. Includes traditional dancing, music, and beer gardens. Popular in Bavarian culture but also celebrated in Saxony.',
    tags: ['may', 'maypole', 'spring', 'festival', 'tradition'],
    region: 'Saxony',
  },

  // Saxony Specific
  {
    category: 'region',
    title: 'Major Cities in Saxony',
    content: 'Leipzig: Creative hub, nightlife, startups. Dresden: Cultural capital, baroque architecture, museums. Zwickau: Engineering, automotive (Audi history), applied sciences. Chemnitz: Industry, innovation, modernism.',
    tags: ['cities', 'leipzig', 'dresden', 'zwickau', 'chemnitz'],
    region: 'Saxony',
  },
  {
    category: 'region',
    title: 'Saxon Cuisine',
    content: 'Traditional dishes: Eierschecke (layered cake), Sauerbraten (marinated roast), Kartoffelsalat (potato salad), Leipziger Allerlei (mixed vegetables). Try local bakeries for authentic Stollen during Christmas.',
    tags: ['food', 'cuisine', 'traditional', 'eierschecke', 'stollen'],
    region: 'Saxony',
  },
  {
    category: 'region',
    title: 'Nature and Outdoor Activities',
    content: 'Explore: Erzgebirge (Ore Mountains - skiing, hiking), Sächsische Schweiz (Saxon Switzerland - rock climbing, hiking), Leipzig\'s Clara-Zetkin-Park, Dresden Elbe riverfront. Perfect for weekend trips.',
    tags: ['nature', 'hiking', 'mountains', 'outdoor', 'travel'],
    region: 'Saxony',
  },
  {
    category: 'region',
    title: 'Public Transport in Saxony',
    content: 'Networks: MDV (Leipzig), VMS (Zwickau/Chemnitz), DVB (Dresden). Student cards often include semester tickets for unlimited travel. Buy tickets before boarding - inspectors issue €60 fines.',
    tags: ['transport', 'bus', 'tram', 'ticket', 'mdv', 'vms'],
    region: 'Saxony',
  },
  {
    category: 'region',
    title: 'Weather and Climate',
    content: 'Saxony climate: Cold winters (avg -2°C to 3°C), mild summers (20-25°C). Snow common Dec-Feb. Invest in warm coat, waterproof boots, and umbrella. Heating season: Oct-Apr.',
    tags: ['weather', 'climate', 'winter', 'summer', 'snow'],
    region: 'Saxony',
  },
  {
    category: 'region',
    title: 'Integration Support Services',
    content: 'Resources for internationals: Welcome Center Sachsen (job/visa help), BAMF Integration Courses (language + culture), Interkulturelles Zentrum Dresden, WHZ International Office. Free counseling available.',
    tags: ['support', 'integration', 'welcome-center', 'help', 'counseling'],
    region: 'Saxony',
  },

  // Myths vs Reality
  {
    category: 'culture',
    title: 'Myth: Germans Have No Humor',
    content: 'Reality: Humor exists but is often dry, situational, and sarcastic. Germans appreciate wit and clever jokes but don\'t use humor as much in professional settings.',
    tags: ['myths', 'humor', 'culture', 'stereotypes'],
    region: 'Germany',
  },
  {
    category: 'culture',
    title: 'Myth: Everyone Speaks Perfect English',
    content: 'Reality: Many Germans speak good English, especially in cities and universities. However, government offices, small towns, and older generations may not. Learning basic German is essential.',
    tags: ['myths', 'english', 'language', 'reality'],
    region: 'Germany',
  },
  {
    category: 'culture',
    title: 'Myth: You Can Ignore Bureaucracy',
    content: 'Reality: IMPOSSIBLE. Paperwork is central to German life. Missing deadlines (Anmeldung, residence permit) can result in fines or legal issues. Take it seriously and complete everything on time.',
    tags: ['myths', 'bureaucracy', 'reality', 'important'],
    region: 'Germany',
  },
  {
    category: 'culture',
    title: 'Myth: Germans Are Cold and Unfriendly',
    content: 'Reality: Germans are reserved and value privacy, but once trust builds, friendships are deep and loyal. They prefer meaningful relationships over superficial small talk.',
    tags: ['myths', 'friendships', 'culture', 'reserved'],
    region: 'Germany',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Clear existing data
      await prisma.culturalInsight.deleteMany({});

      // Seed cultural insights
      const results = await prisma.culturalInsight.createMany({
        data: culturalData,
      });

      console.log(`✅ Seeded ${results.count} cultural insights for Pixi AI`);

      return res.status(200).json({
        message: 'Cultural insights seeded successfully',
        count: results.count,
      });
    } catch (error: any) {
      console.error('Error seeding cultural insights:', error);
      return res.status(500).json({ error: 'Failed to seed data', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

