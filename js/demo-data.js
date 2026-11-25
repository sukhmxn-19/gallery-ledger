// Curated demonstration dataset for Gallery Ledger coursework exhibition.

// Generates a local date string offset from today by a specified number of days.
function formatOffsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Returns demonstration artist records (Official Academic Team: Sukhmanpreet Kaur and Sonam Verma; Salik Riyaz's demonstration artist profile is sample content, not academic team membership).
function getDemoArtists() {
  return [
    { id: 1, name: 'Sukhmanpreet Kaur', born: 2005, nationality: 'Indian', style: 'Paper & Structural Geometry', bio: 'Project contributor to Gallery Ledger. Her demonstration collection investigates paper relief, structural geometry, rhythmic repetition, and negative space as conceptual coursework studies in exhibition design.' },
    { id: 2, name: 'Sonam Verma', born: 2005, nationality: 'Indian', style: 'Architectural Light & Spatial Form', bio: 'Project contributor to Gallery Ledger. Her demonstration collection explores natural illumination, shadow intervals, visual memory, and atmospheric thresholds as conceptual coursework studies in curatorial display.' },
    // Sample content for demonstration exhibition: not academic team membership.
    { id: 3, name: 'Salik Riyaz', born: 2005, nationality: 'Indian', style: 'Field Observation & Astrophotography', bio: 'Salik Riyaz is a founder, researcher and independent filmmaker whose work moves between astronomical inquiry, field documentation and visual storytelling. His interdisciplinary practice explores how observation and documentation can connect scientific understanding with human experience.' }
  ];
}

// Returns the three architectural gallery spaces.
function getDemoSpaces() {
  return [
    { id: 4, name: 'North Gallery', capacity: 6, note: 'Primary exhibition hall with vaulted ceilings, natural light, and expansive hanging walls' },
    { id: 5, name: 'Project Room', capacity: 4, note: 'Intimate architectural chamber designed for experimental visual studies and graphic folios' },
    { id: 6, name: 'Screening Alcove', capacity: 3, note: 'Acoustic dark alcove configured for lens-based media and documentary research presentations' }
  ];
}

// Returns the three scheduled exhibitions demonstrating active, upcoming, and closed states.
function getDemoExhibitions() {
  return [
    { id: 7, title: 'The Act of Looking', theme: 'Observation, Material & Perspective', description: 'Our featured exhibition brings together paper structures, studies in architectural illumination, and field-based observation to examine how looking closely alters form.', startDate: formatOffsetDate(-12), endDate: formatOffsetDate(24) },
    { id: 8, title: 'Rooms for Light', theme: 'Architecture, Illumination & Memory', description: 'An exploration of physical spaces, changing natural illumination, and visual memory across tactile surfaces and delicate spatial compositions.', startDate: formatOffsetDate(35), endDate: formatOffsetDate(70) },
    { id: 9, title: 'Notes in Matter', theme: 'Form, Texture & The Material Record', description: 'An archival survey of early material studies, relief experiments, and documentary field notations investigating tactile texture as historical evidence.', startDate: formatOffsetDate(-80), endDate: formatOffsetDate(-20) }
  ];
}

// Returns the twelve conceptual demonstration artworks representing all three contributors.
function getDemoArtworks() {
  return [
    { id: 10, artistId: 1, title: 'Fold Study No. 01', year: 2024, medium: 'Relief folded vellum on cotton paper', size: '42 × 30 cm', price: 32000, status: 'Available', buyer: '' },
    { id: 11, artistId: 1, title: 'Pressure / Plane', year: 2024, medium: 'Blind debossing and mineral ink on rag paper', size: '50 × 40 cm', price: 48000, status: 'Available', buyer: '' },
    { id: 12, artistId: 1, title: 'Between Two Edges', year: 2025, medium: 'Cut architectural vellum and graphite', size: '60 × 45 cm', price: 54000, status: 'Reserved', buyer: '' },
    { id: 13, artistId: 1, title: 'The Quiet Grid', year: 2024, medium: 'Iron gall ink and paper cut on kozo', size: '35 × 35 cm', price: 28000, status: 'Available', buyer: '' },
    { id: 14, artistId: 2, title: 'Window, 4:17 PM', year: 2024, medium: 'Chiaroscuro pigment study on raw canvas', size: '75 × 55 cm', price: 62000, status: 'Available', buyer: '' },
    { id: 15, artistId: 2, title: 'Soft Architecture', year: 2025, medium: 'Layered gouache and translucent drafting film', size: '80 × 60 cm', price: 76000, status: 'Available', buyer: '' },
    { id: 16, artistId: 2, title: 'Luminous Interval', year: 2025, medium: 'Direct photogram on archival gelatin silver', size: '50 × 40 cm', price: 58000, status: 'Available', buyer: '' },
    { id: 17, artistId: 2, title: 'Rooms in Memory', year: 2024, medium: 'Casein wash and charcoal on cradled board', size: '90 × 70 cm', price: 95000, status: 'Sold', buyer: 'Simranjit Mehta (Coursework collector)' },
    { id: 18, artistId: 3, title: 'Stone / Constellation', year: 2024, medium: 'Field stone rubbing, pigment and celestial chart', size: '65 × 50 cm', price: 68000, status: 'Available', buyer: '' },
    { id: 19, artistId: 3, title: 'Orbit Notation', year: 2025, medium: 'Plotter ink and cyanotype on drafting vellum', size: '70 × 50 cm', price: 72000, status: 'Available', buyer: '' },
    { id: 20, artistId: 3, title: 'A Field of Witnesses', year: 2024, medium: 'Silver gelatin field contact print and field notes', size: '40 × 30 cm', price: 42000, status: 'Available', buyer: '' },
    { id: 21, artistId: 3, title: 'Between Frames', year: 2025, medium: 'Sequential 35mm film stills on back-lit film', size: '100 × 40 cm', price: 88000, status: 'Available', buyer: '' }
  ];
}

// Returns the twelve non-overlapping artwork assignments to gallery spaces.
function getDemoPlacements() {
  return [
    { id: 22, exhibitionId: 7, artworkId: 10, spaceId: 4 },
    { id: 23, exhibitionId: 7, artworkId: 11, spaceId: 4 },
    { id: 24, exhibitionId: 7, artworkId: 14, spaceId: 4 },
    { id: 25, exhibitionId: 7, artworkId: 15, spaceId: 5 },
    { id: 26, exhibitionId: 7, artworkId: 18, spaceId: 5 },
    { id: 27, exhibitionId: 7, artworkId: 19, spaceId: 5 },
    { id: 28, exhibitionId: 8, artworkId: 12, spaceId: 4 },
    { id: 29, exhibitionId: 8, artworkId: 13, spaceId: 4 },
    { id: 30, exhibitionId: 8, artworkId: 16, spaceId: 4 },
    { id: 31, exhibitionId: 8, artworkId: 21, spaceId: 6 },
    { id: 32, exhibitionId: 9, artworkId: 13, spaceId: 5 },
    { id: 33, exhibitionId: 9, artworkId: 20, spaceId: 6 }
  ];
}

// Assembles and returns the full unified curated demonstration repository.
function getCuratedDemoData() {
  return {
    artists: getDemoArtists(),
    spaces: getDemoSpaces(),
    exhibitions: getDemoExhibitions(),
    artworks: getDemoArtworks(),
    placements: getDemoPlacements(),
    nextId: 34
  };
}
