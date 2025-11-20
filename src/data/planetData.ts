export interface PlanetAPI {
  name: string;
  url: string;
  description: string;
}

export interface PlanetData {
  name: string;
  displayName: string;
  image: string;
  quickFacts: {
    diameter: string;
    distanceFromSun: string;
    orbitalPeriod: string;
    rotationPeriod: string;
    moons: string;
    surfaceTemperature: string;
    mass: string;
    gravity: string;
  };
  composition: {
    summary: string;
    atmosphere?: string[];
  };
  notableFeatures: string[];
  apis: PlanetAPI[];
  description: string;
}

export const planetsDataDetailed: Record<string, PlanetData> = {
  sun: {
    name: 'sun',
    displayName: 'The Sun',
    image: '/textures/sun.jpg',
    description: 'The Sun is the star at the center of our Solar System, a nearly perfect sphere of hot plasma that provides light and heat to Earth.',
    quickFacts: {
      diameter: '1,391,000 km',
      distanceFromSun: '0 km (center)',
      orbitalPeriod: 'N/A',
      rotationPeriod: '~25 days (equator)',
      moons: '0',
      surfaceTemperature: '~5,500°C',
      mass: '1.989 × 10³⁰ kg',
      gravity: '274 m/s²',
    },
    composition: {
      summary: 'Primarily hydrogen (73%) and helium (25%), with trace amounts of heavier elements',
      atmosphere: ['Hydrogen 73%', 'Helium 25%', 'Oxygen 0.8%', 'Carbon 0.3%'],
    },
    notableFeatures: [
      'Source of all light and heat in the Solar System',
      'Nuclear fusion occurs in its core',
      'Solar flares and coronal mass ejections affect Earth',
      'Has an 11-year solar activity cycle',
      'Composed of different layers: core, radiative zone, convective zone, photosphere, chromosphere, corona',
    ],
    apis: [
      {
        name: 'NOAA Space Weather',
        url: 'https://www.swpc.noaa.gov/',
        description: 'Real-time solar wind, sunspot data, and solar activity',
      },
      {
        name: 'Solar Dynamics Observatory API',
        url: 'https://sdo.gsfc.nasa.gov/',
        description: 'High-resolution solar imagery and data',
      },
    ],
  },
  mercury: {
    name: 'mercury',
    displayName: 'Mercury',
    image: '/textures/mercury.jpg',
    description: 'Mercury is the smallest planet in our Solar System and the closest to the Sun, with extreme temperature variations.',
    quickFacts: {
      diameter: '4,879 km',
      distanceFromSun: '57.9 million km',
      orbitalPeriod: '88 Earth days',
      rotationPeriod: '59 Earth days',
      moons: '0',
      surfaceTemperature: '-173°C to 427°C',
      mass: '3.30 × 10²³ kg',
      gravity: '3.7 m/s²',
    },
    composition: {
      summary: 'Rocky planet with a large iron core (about 75% of the planet\'s diameter)',
      atmosphere: ['Trace amounts of oxygen', 'sodium', 'hydrogen', 'helium', 'potassium'],
    },
    notableFeatures: [
      'Smallest planet in the Solar System',
      'Has the most eccentric orbit of all planets',
      'Surface heavily cratered like the Moon',
      'Experiences the greatest temperature range of any planet',
      'No atmosphere to retain heat',
      'Named after the Roman messenger god',
    ],
    apis: [
      {
        name: 'NASA API - Mercury Missions',
        url: 'https://api.nasa.gov/',
        description: 'Data from MESSENGER mission and Mercury observations',
      },
    ],
  },
  venus: {
    name: 'venus',
    displayName: 'Venus',
    image: '/textures/venus.jpg',
    description: 'Venus is the hottest planet in our Solar System, known for its thick toxic atmosphere and extreme greenhouse effect.',
    quickFacts: {
      diameter: '12,104 km',
      distanceFromSun: '108.2 million km',
      orbitalPeriod: '225 Earth days',
      rotationPeriod: '243 Earth days (retrograde)',
      moons: '0',
      surfaceTemperature: '~462°C',
      mass: '4.87 × 10²⁴ kg',
      gravity: '8.87 m/s²',
    },
    composition: {
      summary: 'Rocky planet with dense atmosphere dominated by carbon dioxide and sulfuric acid clouds',
      atmosphere: ['Carbon Dioxide 96.5%', 'Nitrogen 3.5%', 'Sulfur Dioxide traces', 'Sulfuric Acid clouds'],
    },
    notableFeatures: [
      'Hottest planet due to extreme greenhouse effect',
      'Rotates backwards (retrograde rotation)',
      'Day longer than year on Venus',
      'Brightest natural object in night sky after the Moon',
      'Surface pressure 92 times that of Earth',
      'Named after the Roman goddess of love and beauty',
    ],
    apis: [
      {
        name: 'NASA API - Venus Data',
        url: 'https://api.nasa.gov/',
        description: 'Venus missions data and observations',
      },
    ],
  },
  earth: {
    name: 'earth',
    displayName: 'Earth',
    image: '/textures/earth.jpg',
    description: 'Earth is the only known planet to harbor life, with vast oceans covering 71% of its surface and a protective atmosphere.',
    quickFacts: {
      diameter: '12,742 km',
      distanceFromSun: '149.6 million km',
      orbitalPeriod: '365.25 days',
      rotationPeriod: '24 hours',
      moons: '1 (The Moon)',
      surfaceTemperature: '-88°C to 58°C',
      mass: '5.97 × 10²⁴ kg',
      gravity: '9.81 m/s²',
    },
    composition: {
      summary: 'Rocky planet with iron core, silicate mantle, and crust covered by water and continents',
      atmosphere: ['Nitrogen 78%', 'Oxygen 21%', 'Argon 0.9%', 'Carbon Dioxide 0.04%', 'Water vapor (variable)'],
    },
    notableFeatures: [
      'Only known planet with life',
      'Liquid water covers 71% of surface',
      'Protected by magnetic field and ozone layer',
      'Active plate tectonics shape the surface',
      'Diverse ecosystems and climates',
      'Has one large natural satellite (the Moon)',
    ],
    apis: [
      {
        name: 'NASA EONET - Earth Events',
        url: 'https://eonet.gsfc.nasa.gov/api/v3/events',
        description: 'Natural events: wildfires, storms, volcanoes, floods',
      },
      {
        name: 'OpenWeather API',
        url: 'https://openweathermap.org/api',
        description: 'Current weather, forecasts, and climate data',
      },
      {
        name: 'NOAA Climate API',
        url: 'https://www.ncdc.noaa.gov/cdo-web/webservices/v2',
        description: 'Climate data, temperature records, precipitation',
      },
      {
        name: 'NASA Earth Observatory',
        url: 'https://earthobservatory.nasa.gov/',
        description: 'Satellite imagery and environmental data',
      },
      {
        name: 'ISS Location API',
        url: 'http://api.open-notify.org/iss-now.json',
        description: 'Real-time International Space Station location',
      },
    ],
  },
  mars: {
    name: 'mars',
    displayName: 'Mars',
    image: '/textures/mars.jpg',
    description: 'Mars is the Red Planet, known for its rusty color from iron oxide, and is the focus of many exploration missions.',
    quickFacts: {
      diameter: '6,779 km',
      distanceFromSun: '227.9 million km',
      orbitalPeriod: '687 Earth days',
      rotationPeriod: '24.6 hours',
      moons: '2 (Phobos, Deimos)',
      surfaceTemperature: '-153°C to 20°C',
      mass: '6.42 × 10²³ kg',
      gravity: '3.71 m/s²',
    },
    composition: {
      summary: 'Rocky planet with iron oxide-rich soil giving it red color, thin carbon dioxide atmosphere',
      atmosphere: ['Carbon Dioxide 95.3%', 'Nitrogen 2.7%', 'Argon 1.6%', 'Oxygen 0.13%'],
    },
    notableFeatures: [
      'Called the Red Planet due to iron oxide on surface',
      'Home to Olympus Mons, largest volcano in Solar System',
      'Valles Marineris canyon system stretches 4,000 km',
      'Evidence of ancient water flows and ice caps',
      'Multiple rovers currently exploring surface',
      'Target for future human missions',
    ],
    apis: [
      {
        name: 'NASA Mars Rover Photos',
        url: 'https://api.nasa.gov/mars-photos/api/v1',
        description: 'Images from Curiosity, Perseverance, and other rovers',
      },
      {
        name: 'Mars Weather API',
        url: 'https://api.nasa.gov/insight_weather/',
        description: 'Weather data from InSight lander',
      },
      {
        name: 'NASA Mars Assets',
        url: 'https://api.nasa.gov/',
        description: 'Mars missions data, images, and videos',
      },
    ],
  },
  jupiter: {
    name: 'jupiter',
    displayName: 'Jupiter',
    image: '/textures/jupiter.jpg',
    description: 'Jupiter is the largest planet in our Solar System, a gas giant with a powerful magnetic field and the famous Great Red Spot.',
    quickFacts: {
      diameter: '139,820 km',
      distanceFromSun: '778.5 million km',
      orbitalPeriod: '11.9 Earth years',
      rotationPeriod: '9.9 hours',
      moons: '95+ known moons',
      surfaceTemperature: '-145°C (cloud tops)',
      mass: '1.898 × 10²⁷ kg',
      gravity: '24.79 m/s²',
    },
    composition: {
      summary: 'Gas giant primarily composed of hydrogen and helium with no solid surface',
      atmosphere: ['Hydrogen 90%', 'Helium 10%', 'Methane', 'Ammonia', 'Water vapor'],
    },
    notableFeatures: [
      'Largest planet in the Solar System',
      'Great Red Spot - a storm larger than Earth',
      'Has at least 95 moons including Ganymede (largest moon)',
      'Powerful magnetic field extends millions of kilometers',
      'Protects inner planets from asteroids and comets',
      'Named after the king of Roman gods',
    ],
    apis: [
      {
        name: 'NASA Juno Mission Data',
        url: 'https://www.missionjuno.swri.edu/',
        description: 'Data from Juno spacecraft orbiting Jupiter',
      },
      {
        name: 'NASA API - Jupiter',
        url: 'https://api.nasa.gov/',
        description: 'Jupiter images, videos, and mission data',
      },
    ],
  },
  saturn: {
    name: 'saturn',
    displayName: 'Saturn',
    image: '/textures/saturn.jpg',
    description: 'Saturn is famous for its spectacular ring system, the most extensive and complex in our Solar System.',
    quickFacts: {
      diameter: '116,460 km',
      distanceFromSun: '1.43 billion km',
      orbitalPeriod: '29.5 Earth years',
      rotationPeriod: '10.7 hours',
      moons: '146+ known moons',
      surfaceTemperature: '-178°C (cloud tops)',
      mass: '5.68 × 10²⁶ kg',
      gravity: '10.44 m/s²',
    },
    composition: {
      summary: 'Gas giant similar to Jupiter, with extensive ring system made of ice and rock',
      atmosphere: ['Hydrogen 96%', 'Helium 3%', 'Methane', 'Ammonia'],
    },
    notableFeatures: [
      'Most spectacular ring system in the Solar System',
      'Rings made of billions of ice and rock particles',
      'Titan, its largest moon, has liquid methane lakes',
      'Least dense planet - would float in water',
      'Hexagonal storm at north pole',
      'Named after Roman god of agriculture',
    ],
    apis: [
      {
        name: 'NASA Cassini Mission',
        url: 'https://solarsystem.nasa.gov/missions/cassini/',
        description: 'Data from Cassini mission that explored Saturn',
      },
      {
        name: 'NASA API - Saturn',
        url: 'https://api.nasa.gov/',
        description: 'Saturn images, videos, and mission data',
      },
    ],
  },
  uranus: {
    name: 'uranus',
    displayName: 'Uranus',
    image: '/textures/uranus.jpg',
    description: 'Uranus is an ice giant that rotates on its side, giving it extreme seasonal variations lasting decades.',
    quickFacts: {
      diameter: '50,724 km',
      distanceFromSun: '2.87 billion km',
      orbitalPeriod: '84 Earth years',
      rotationPeriod: '17.2 hours (retrograde)',
      moons: '27+ known moons',
      surfaceTemperature: '-224°C',
      mass: '8.68 × 10²⁵ kg',
      gravity: '8.87 m/s²',
    },
    composition: {
      summary: 'Ice giant with atmosphere of hydrogen, helium, and methane giving it blue-green color',
      atmosphere: ['Hydrogen 83%', 'Helium 15%', 'Methane 2%', 'Ammonia', 'Water ice'],
    },
    notableFeatures: [
      'Rotates on its side (98° axial tilt)',
      'Coldest planetary atmosphere in Solar System',
      'Blue-green color from methane in atmosphere',
      'Has faint ring system',
      'First planet discovered with telescope (1781)',
      'Extreme seasons lasting about 21 years each',
    ],
    apis: [
      {
        name: 'NASA API - Uranus',
        url: 'https://api.nasa.gov/',
        description: 'Uranus images and data from Voyager 2',
      },
    ],
  },
  neptune: {
    name: 'neptune',
    displayName: 'Neptune',
    image: '/textures/neptune.jpg',
    description: 'Neptune is the most distant planet from the Sun, a dark, cold ice giant with the fastest winds in the Solar System.',
    quickFacts: {
      diameter: '49,244 km',
      distanceFromSun: '4.5 billion km',
      orbitalPeriod: '165 Earth years',
      rotationPeriod: '16.1 hours',
      moons: '16+ known moons',
      surfaceTemperature: '-214°C',
      mass: '1.02 × 10²⁶ kg',
      gravity: '11.15 m/s²',
    },
    composition: {
      summary: 'Ice giant similar to Uranus, with deep blue color from methane absorption',
      atmosphere: ['Hydrogen 80%', 'Helium 19%', 'Methane 1.5%', 'Ammonia', 'Water ice'],
    },
    notableFeatures: [
      'Most distant planet from the Sun',
      'Fastest winds in Solar System (up to 2,100 km/h)',
      'Deep blue color from methane in atmosphere',
      'Has Great Dark Spot storm system',
      'Triton, its largest moon, is geologically active',
      'Discovered through mathematical predictions',
    ],
    apis: [
      {
        name: 'NASA API - Neptune',
        url: 'https://api.nasa.gov/',
        description: 'Neptune images and data from Voyager 2',
      },
    ],
  },
  moon: {
    name: 'moon',
    displayName: 'The Moon',
    image: '/textures/moon.jpg',
    description: 'Earth\'s only natural satellite, the Moon influences tides, stabilizes Earth\'s rotation, and has been visited by humans.',
    quickFacts: {
      diameter: '3,474 km',
      distanceFromSun: '~149.6 million km (orbits Earth)',
      orbitalPeriod: '27.3 days (around Earth)',
      rotationPeriod: '27.3 days (tidally locked)',
      moons: '0',
      surfaceTemperature: '-173°C to 127°C',
      mass: '7.35 × 10²² kg',
      gravity: '1.62 m/s²',
    },
    composition: {
      summary: 'Rocky body with ancient heavily cratered surface, no atmosphere',
      atmosphere: ['Virtually none', 'Trace amounts of helium, neon, hydrogen'],
    },
    notableFeatures: [
      'Only celestial body visited by humans',
      'Causes ocean tides on Earth',
      'Always shows same face to Earth (tidally locked)',
      'Surface covered with impact craters',
      'Has water ice in permanently shadowed craters',
      'Apollo missions brought back 382 kg of lunar samples',
    ],
    apis: [
      {
        name: 'NASA Moon API',
        url: 'https://api.nasa.gov/',
        description: 'Lunar data, Apollo mission archives, and moon phases',
      },
      {
        name: 'Moon Phase API',
        url: 'https://api.farmsense.net/v1/moonphases/',
        description: 'Current and upcoming moon phases',
      },
    ],
  },
};
