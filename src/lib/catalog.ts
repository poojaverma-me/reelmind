import type { Genre, Language, Mood, Movie, Profile } from "./types";

function m(
  id: string,
  title: string,
  year: number,
  language: Language,
  genres: Genre[],
  mood: Mood,
  rating: number,
  runtime: number,
  synopsis: string,
  studio?: string,
): Movie {
  return { id, title, year, language, genres, mood, rating, runtime, synopsis, studio, inCatalog: true };
}

function past(id: string, title: string, year: number, genres: Genre[], mood: Mood, language: Language = "English", studio?: string): Movie {
  return { id, title, year, language, genres, mood, studio, inCatalog: false };
}

/** Everything streaming right now — what Jev can recommend. */
export const CATALOG: Movie[] = [
  // Superhero
  m("avengers-endgame", "Avengers: Endgame", 2019, "English", ["Superhero", "Action"], "balanced", 8.4, 181, "The surviving Avengers attempt one impossible heist across time to undo Thanos's snap.", "Marvel Studios"),
  m("avengers-infinity-war", "Avengers: Infinity War", 2018, "English", ["Superhero", "Action"], "dark", 8.4, 149, "Earth's heroes unite against Thanos as he hunts the six Infinity Stones.", "Marvel Studios"),
  m("spider-man-no-way-home", "Spider-Man: No Way Home", 2021, "English", ["Superhero", "Action"], "balanced", 8.2, 148, "Peter Parker's unmasking leads to a spell gone wrong that pulls villains in from other universes.", "Marvel Studios"),
  m("guardians-3", "Guardians of the Galaxy Vol. 3", 2023, "English", ["Superhero", "Comedy"], "balanced", 7.9, 150, "The Guardians race to save Rocket and confront the scientist who made him.", "Marvel Studios"),
  m("deadpool-wolverine", "Deadpool & Wolverine", 2024, "English", ["Superhero", "Comedy"], "light", 7.6, 128, "A foul-mouthed mercenary drags a reluctant Wolverine into a multiverse-saving mission.", "Marvel Studios"),
  m("doctor-strange-mom", "Doctor Strange in the Multiverse of Madness", 2022, "English", ["Superhero", "Fantasy"], "dark", 6.9, 126, "Strange protects a teenager who can travel the multiverse from a powerful former ally.", "Marvel Studios"),
  m("black-panther-wakanda", "Black Panther: Wakanda Forever", 2022, "English", ["Superhero", "Drama"], "balanced", 6.7, 161, "Wakanda mourns its king while a hidden undersea nation rises to challenge it.", "Marvel Studios"),
  m("the-batman", "The Batman", 2022, "English", ["Superhero", "Crime"], "dark", 7.8, 176, "In his second year of crime-fighting, Batman follows a serial killer's riddles into Gotham's corruption.", "DC"),
  m("the-dark-knight", "The Dark Knight", 2008, "English", ["Superhero", "Crime"], "dark", 9.0, 152, "Batman faces the Joker, an agent of chaos determined to prove anyone can be corrupted.", "DC"),
  m("joker", "Joker", 2019, "English", ["Crime", "Drama"], "dark", 8.4, 122, "A struggling comedian's descent into madness sparks a violent movement in Gotham.", "DC"),
  m("logan", "Logan", 2017, "English", ["Superhero", "Action"], "dark", 8.1, 137, "An ageing Wolverine protects a young mutant on a desperate road trip across the border."),
  m("the-suicide-squad", "The Suicide Squad", 2021, "English", ["Superhero", "Comedy"], "balanced", 7.2, 132, "A team of expendable supervillains is dropped onto a hostile island on a suicide mission.", "DC"),

  // Action
  m("mad-max-fury-road", "Mad Max: Fury Road", 2015, "English", ["Action", "Sci-Fi"], "dark", 8.1, 120, "In a desert wasteland, a rebel warrior and a drifter flee a tyrant in a roaring war-rig chase."),
  m("john-wick-4", "John Wick: Chapter 4", 2023, "English", ["Action", "Crime"], "dark", 7.7, 169, "John Wick takes on the High Table across four continents for his freedom."),
  m("top-gun-maverick", "Top Gun: Maverick", 2022, "English", ["Action", "Drama"], "light", 8.2, 130, "A veteran ace trains a squad of young pilots for a mission no one is expected to survive."),
  m("mi-fallout", "Mission: Impossible – Fallout", 2018, "English", ["Action", "Thriller"], "balanced", 7.7, 147, "Ethan Hunt races to recover stolen plutonium after a mission goes catastrophically wrong."),
  m("extraction", "Extraction", 2020, "English", ["Action", "Thriller"], "dark", 6.7, 116, "A black-market mercenary is hired to rescue a kidnapped boy from a crime lord in Dhaka.", "Netflix"),
  m("the-gray-man", "The Gray Man", 2022, "English", ["Action", "Thriller"], "balanced", 6.5, 122, "A CIA operative who knows too much is hunted around the globe by a sociopathic ex-colleague.", "Netflix"),
  m("furiosa", "Furiosa: A Mad Max Saga", 2024, "English", ["Action", "Sci-Fi"], "dark", 7.5, 148, "Taken from the Green Place, young Furiosa spends years plotting her way home through the wasteland."),
  m("rrr", "RRR", 2022, "Telugu", ["Action", "Drama"], "balanced", 7.8, 187, "Two revolutionaries forge a fierce friendship in 1920s India before finding themselves on opposite sides."),

  // Sci-Fi
  m("interstellar", "Interstellar", 2014, "English", ["Sci-Fi", "Drama"], "balanced", 8.7, 169, "A farmer-turned-pilot leads a desperate mission through a wormhole to find humanity a new home."),
  m("arrival", "Arrival", 2016, "English", ["Sci-Fi", "Drama"], "balanced", 7.9, 116, "A linguist must decode the language of visitors from another world before panic tips into war."),
  m("blade-runner-2049", "Blade Runner 2049", 2017, "English", ["Sci-Fi", "Thriller"], "dark", 8.0, 164, "A replicant hunter unearths a buried secret that could erase the line between human and machine."),
  m("dune-part-two", "Dune: Part Two", 2024, "English", ["Sci-Fi", "Action"], "dark", 8.5, 166, "Paul Atreides joins the Fremen of Arrakis to wage war on the houses that destroyed his family."),
  m("ex-machina", "Ex Machina", 2014, "English", ["Sci-Fi", "Thriller"], "dark", 7.7, 108, "A young coder is asked to judge whether a reclusive CEO's humanoid AI is truly conscious.", "A24"),
  m("the-martian", "The Martian", 2015, "English", ["Sci-Fi", "Drama"], "light", 8.0, 144, "Stranded alone on Mars, a botanist engineers his way to survival with wit and duct tape."),
  m("eeaao", "Everything Everywhere All at Once", 2022, "English", ["Sci-Fi", "Comedy"], "balanced", 7.8, 139, "A frazzled laundromat owner must channel her multiverse selves to save every reality.", "A24"),
  m("edge-of-tomorrow", "Edge of Tomorrow", 2014, "English", ["Sci-Fi", "Action"], "balanced", 7.9, 113, "A soldier stuck in a time loop relives the same alien battle until he learns how to win it."),
  m("avatar-2", "Avatar: The Way of Water", 2022, "English", ["Sci-Fi", "Action"], "balanced", 7.5, 192, "Jake Sully's family flees to Pandora's ocean clans when an old threat returns."),
  m("dont-look-up", "Don't Look Up", 2021, "English", ["Comedy", "Sci-Fi"], "balanced", 7.2, 138, "Two astronomers try to warn a distracted world about a planet-killing comet.", "Netflix"),
  m("the-adam-project", "The Adam Project", 2022, "English", ["Sci-Fi", "Comedy"], "light", 6.7, 106, "A time-travelling pilot teams up with his 12-year-old self to save the future.", "Netflix"),
  m("godzilla-minus-one", "Godzilla Minus One", 2023, "Japanese", ["Sci-Fi", "Action"], "dark", 7.7, 125, "In post-war Japan, a guilt-ridden pilot faces a monster that threatens to wipe out what's left."),

  // Horror
  m("hereditary", "Hereditary", 2018, "English", ["Horror", "Drama"], "dark", 7.3, 127, "After their secretive grandmother dies, a grieving family uncovers a terrifying inheritance.", "A24"),
  m("get-out", "Get Out", 2017, "English", ["Horror", "Thriller"], "dark", 7.8, 104, "A weekend visit to his girlfriend's parents reveals something sinister beneath their hospitality."),
  m("a-quiet-place", "A Quiet Place", 2018, "English", ["Horror", "Sci-Fi"], "dark", 7.5, 90, "A family lives in total silence on a farm hunted by creatures that track every sound."),
  m("talk-to-me", "Talk to Me", 2022, "English", ["Horror"], "dark", 7.1, 95, "Teens hooked on a party trick with an embalmed hand open a door to the dead they can't close.", "A24"),
  m("train-to-busan", "Train to Busan", 2016, "Korean", ["Horror", "Action"], "dark", 7.6, 118, "A father and daughter fight to survive aboard a bullet train as a zombie outbreak sweeps Korea."),
  m("m3gan", "M3GAN", 2022, "English", ["Horror", "Sci-Fi"], "balanced", 6.3, 102, "A toy-company roboticist's lifelike AI doll becomes dangerously protective of her niece."),
  m("longlegs", "Longlegs", 2024, "English", ["Horror", "Thriller"], "dark", 6.6, 101, "An FBI agent with uncanny intuition hunts a serial killer tied to occult messages."),
  m("the-substance", "The Substance", 2024, "English", ["Horror", "Drama"], "dark", 7.3, 141, "A fading star tries a black-market drug that creates a younger, better version of herself."),
  m("bird-box", "Bird Box", 2018, "English", ["Horror", "Thriller"], "dark", 6.6, 124, "Blindfolded, a mother leads two children downriver to escape a presence that drives people mad.", "Netflix"),
  m("nosferatu-2024", "Nosferatu", 2024, "English", ["Horror", "Fantasy"], "dark", 7.2, 132, "A young woman in 1830s Germany is haunted by an ancient vampire obsessed with her."),

  // Thriller & crime
  m("parasite", "Parasite", 2019, "Korean", ["Thriller", "Comedy"], "dark", 8.5, 132, "A struggling family cons its way into a wealthy household until a hidden secret upends everyone."),
  m("oldboy", "Oldboy", 2003, "Korean", ["Thriller", "Crime"], "dark", 8.3, 120, "Imprisoned fifteen years without explanation, a man is freed and given five days to learn why."),
  m("gone-girl", "Gone Girl", 2014, "English", ["Thriller", "Crime"], "dark", 8.1, 149, "On their fifth anniversary a wife vanishes, and the media turns her husband into the prime suspect."),
  m("prisoners", "Prisoners", 2013, "English", ["Thriller", "Crime"], "dark", 8.1, 153, "When two young girls disappear, a desperate father takes the law into his own hands."),
  m("knives-out", "Knives Out", 2019, "English", ["Crime", "Comedy"], "light", 7.9, 130, "A famed detective untangles a wealthy family's lies after its patriarch dies on his 85th birthday."),
  m("glass-onion", "Glass Onion", 2022, "English", ["Crime", "Comedy"], "light", 7.1, 139, "Benoit Blanc joins a tech billionaire's private-island murder-mystery party that turns real.", "Netflix"),
  m("the-invisible-guest", "The Invisible Guest", 2016, "Spanish", ["Thriller", "Crime"], "balanced", 8.0, 106, "A businessman accused of murder has one night with a star lawyer to rebuild what really happened.", "Netflix"),
  m("zodiac", "Zodiac", 2007, "English", ["Crime", "Thriller"], "dark", 7.7, 157, "A cartoonist becomes obsessed with unmasking the elusive Zodiac killer."),
  m("the-departed", "The Departed", 2006, "English", ["Crime", "Thriller"], "dark", 8.5, 151, "An undercover cop and a mole inside the police race to expose each other in the Boston mob."),
  m("nightcrawler", "Nightcrawler", 2014, "English", ["Thriller", "Crime"], "dark", 7.8, 117, "A driven loner muscles into LA's crime-news business, crossing every line for the perfect shot."),
  m("leave-the-world-behind", "Leave the World Behind", 2023, "English", ["Thriller", "Drama"], "dark", 6.5, 141, "A family's getaway is shattered when a cyberattack plunges the country into darkness.", "Netflix"),
  m("the-killer", "The Killer", 2023, "English", ["Thriller", "Crime"], "dark", 6.7, 118, "After a near miss, a meticulous assassin battles his employers on an international manhunt.", "Netflix"),
  m("anatomy-of-a-fall", "Anatomy of a Fall", 2023, "French", ["Crime", "Drama"], "balanced", 7.7, 151, "A writer stands trial for her husband's death, with their blind son the only witness."),

  // Drama
  m("shawshank", "The Shawshank Redemption", 1994, "English", ["Drama", "Crime"], "balanced", 9.3, 142, "A banker sentenced to life finds friendship and quiet defiance across two decades behind bars."),
  m("whiplash", "Whiplash", 2014, "English", ["Drama"], "dark", 8.5, 106, "An ambitious young drummer is pushed to the brink by a ruthless conductor who demands perfection."),
  m("oppenheimer", "Oppenheimer", 2023, "English", ["Drama", "Thriller"], "dark", 8.3, 180, "The story of the physicist who led the race to build the atomic bomb, and what it cost him."),
  m("past-lives", "Past Lives", 2023, "Korean", ["Drama", "Romance"], "balanced", 7.8, 105, "Childhood sweethearts separated by emigration meet again in New York two decades later.", "A24"),
  m("the-irishman", "The Irishman", 2019, "English", ["Crime", "Drama"], "dark", 7.8, 209, "A mob hitman looks back on a lifetime of loyalty and the disappearance of Jimmy Hoffa.", "Netflix"),
  m("marriage-story", "Marriage Story", 2019, "English", ["Drama", "Romance"], "balanced", 7.9, 137, "A stage director and an actress navigate a coast-to-coast divorce that tests everything.", "Netflix"),
  m("all-quiet", "All Quiet on the Western Front", 2022, "German", ["Drama", "Action"], "dark", 7.8, 148, "A young German soldier's idealism is destroyed in the trenches of the First World War.", "Netflix"),
  m("the-holdovers", "The Holdovers", 2023, "English", ["Drama", "Comedy"], "light", 7.9, 133, "A cranky teacher, a grieving cook and a stranded student share a Christmas break at boarding school."),
  m("society-of-the-snow", "Society of the Snow", 2023, "Spanish", ["Drama", "Thriller"], "dark", 7.8, 144, "Survivors of a 1972 plane crash in the Andes endure the unthinkable to stay alive.", "Netflix"),

  // Comedy
  m("grand-budapest", "The Grand Budapest Hotel", 2014, "English", ["Comedy", "Crime"], "light", 8.1, 99, "A legendary concierge and his lobby boy are framed for murder in a pastel-hued European caper."),
  m("barbie", "Barbie", 2023, "English", ["Comedy", "Fantasy"], "light", 6.8, 114, "Barbie's perfect life in Barbieland cracks, sending her and Ken into the real world."),
  m("the-nice-guys", "The Nice Guys", 2016, "English", ["Comedy", "Crime"], "light", 7.4, 116, "A hired enforcer and a hapless private eye investigate a missing girl in 1970s Los Angeles."),
  m("free-guy", "Free Guy", 2021, "English", ["Comedy", "Action"], "light", 7.1, 115, "A bank teller discovers he's a background character in a video game and decides to be the hero."),
  m("game-night", "Game Night", 2018, "English", ["Comedy", "Crime"], "light", 6.9, 100, "A couple's weekly game night turns into a real kidnapping mystery."),
  m("red-notice", "Red Notice", 2021, "English", ["Action", "Comedy"], "light", 6.3, 118, "An FBI profiler teams up with an art thief to catch the world's most wanted criminal.", "Netflix"),

  // Romance
  m("la-la-land", "La La Land", 2016, "English", ["Romance", "Drama"], "balanced", 8.0, 128, "A jazz pianist and an aspiring actress fall in love while chasing their dreams in Los Angeles."),
  m("about-time", "About Time", 2013, "English", ["Romance", "Comedy"], "light", 7.8, 123, "A young man learns he can travel back in time and uses it to win love."),
  m("before-sunrise", "Before Sunrise", 1995, "English", ["Romance", "Drama"], "light", 8.1, 101, "Two strangers on a train spend one night walking and talking their way through Vienna."),
  m("anyone-but-you", "Anyone But You", 2023, "English", ["Romance", "Comedy"], "light", 6.1, 103, "After a disastrous first date, two rivals fake a relationship at a destination wedding."),
  m("to-all-the-boys", "To All the Boys I've Loved Before", 2018, "English", ["Romance", "Comedy"], "light", 7.0, 99, "A teen's secret love letters are mailed to all her past crushes at once.", "Netflix"),
  m("set-it-up", "Set It Up", 2018, "English", ["Romance", "Comedy"], "light", 6.5, 105, "Two overworked assistants scheme to set up their demanding bosses.", "Netflix"),
  m("amelie", "Amélie", 2001, "French", ["Comedy", "Romance"], "light", 8.3, 122, "A shy Parisian waitress secretly orchestrates small joys in other people's lives."),

  // Animation & family
  m("spirited-away", "Spirited Away", 2001, "Japanese", ["Animation", "Fantasy"], "balanced", 8.6, 125, "A girl wanders into a bathhouse for spirits and must work to free her parents from a witch's curse.", "Studio Ghibli"),
  m("spider-verse", "Spider-Man: Across the Spider-Verse", 2023, "English", ["Animation", "Superhero"], "light", 8.5, 140, "Miles Morales is catapulted across the multiverse and clashes with a society of Spider-People."),
  m("coco", "Coco", 2017, "English", ["Animation", "Fantasy"], "light", 8.4, 105, "A music-loving boy crosses into the Land of the Dead to uncover his family's forgotten story.", "Pixar"),
  m("inside-out-2", "Inside Out 2", 2024, "English", ["Animation", "Comedy"], "light", 7.6, 96, "Riley hits her teens and a new crew of emotions, led by Anxiety, moves into headquarters.", "Pixar"),
  m("your-name", "Your Name", 2016, "Japanese", ["Animation", "Romance"], "balanced", 8.4, 106, "Two teenagers who've never met begin swapping bodies — and a comet changes everything."),
  m("the-wild-robot", "The Wild Robot", 2024, "English", ["Animation", "Drama"], "light", 8.2, 102, "A shipwrecked robot learns to survive on a wild island and becomes mother to an orphaned gosling."),
  m("klaus", "Klaus", 2019, "English", ["Animation", "Comedy"], "light", 8.2, 96, "A selfish postman and a reclusive toymaker accidentally start a Christmas legend.", "Netflix"),
  m("puss-in-boots-2", "Puss in Boots: The Last Wish", 2022, "English", ["Animation", "Action"], "light", 7.8, 102, "Down to his last life, Puss sets out to find the mythical Last Wish."),
  m("mitchells-vs-machines", "The Mitchells vs. the Machines", 2021, "English", ["Animation", "Comedy"], "light", 7.6, 114, "A dysfunctional family road trip collides with a global robot uprising.", "Netflix"),
  m("wonka", "Wonka", 2023, "English", ["Fantasy", "Comedy"], "light", 7.0, 116, "A young Willy Wonka arrives in a city ruled by a chocolate cartel with big dreams and little money."),
  m("enola-holmes", "Enola Holmes", 2020, "English", ["Crime", "Comedy"], "light", 6.6, 123, "Sherlock's teenage sister outwits her brothers while searching for their missing mother.", "Netflix"),
];

/** Titles viewers watched earlier — part of their history, not currently streaming. */
export const ARCHIVE: Movie[] = [
  // Alex — Marvel & superheroes
  past("iron-man", "Iron Man", 2008, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("the-avengers", "The Avengers", 2012, ["Superhero", "Action"], "light", "English", "Marvel Studios"),
  past("winter-soldier", "Captain America: The Winter Soldier", 2014, ["Superhero", "Thriller"], "balanced", "English", "Marvel Studios"),
  past("guardians-1", "Guardians of the Galaxy", 2014, ["Superhero", "Comedy"], "light", "English", "Marvel Studios"),
  past("thor-ragnarok", "Thor: Ragnarok", 2017, ["Superhero", "Comedy"], "light", "English", "Marvel Studios"),
  past("black-panther", "Black Panther", 2018, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("doctor-strange", "Doctor Strange", 2016, ["Superhero", "Fantasy"], "balanced", "English", "Marvel Studios"),
  past("ant-man", "Ant-Man", 2015, ["Superhero", "Comedy"], "light", "English", "Marvel Studios"),
  past("civil-war", "Captain America: Civil War", 2016, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("spider-man-homecoming", "Spider-Man: Homecoming", 2017, ["Superhero", "Comedy"], "light", "English", "Marvel Studios"),
  past("age-of-ultron", "Avengers: Age of Ultron", 2015, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("iron-man-3", "Iron Man 3", 2013, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("deadpool", "Deadpool", 2016, ["Superhero", "Comedy"], "light"),
  past("days-of-future-past", "X-Men: Days of Future Past", 2014, ["Superhero", "Sci-Fi"], "balanced"),
  past("man-of-steel", "Man of Steel", 2013, ["Superhero", "Action"], "balanced", "English", "DC"),
  past("wonder-woman", "Wonder Woman", 2017, ["Superhero", "Action"], "balanced", "English", "DC"),
  past("batman-begins", "Batman Begins", 2005, ["Superhero", "Crime"], "dark", "English", "DC"),
  past("dark-knight-rises", "The Dark Knight Rises", 2012, ["Superhero", "Crime"], "dark", "English", "DC"),
  past("shang-chi", "Shang-Chi and the Legend of the Ten Rings", 2021, ["Superhero", "Action"], "balanced", "English", "Marvel Studios"),
  past("captain-marvel", "Captain Marvel", 2019, ["Superhero", "Sci-Fi"], "light", "English", "Marvel Studios"),
  past("fast-five", "Fast Five", 2011, ["Action", "Crime"], "light"),
  past("venom", "Venom", 2018, ["Superhero", "Action"], "balanced"),

  // Meera — cerebral sci-fi
  past("inception", "Inception", 2010, ["Sci-Fi", "Thriller"], "balanced"),
  past("the-prestige", "The Prestige", 2006, ["Thriller", "Drama"], "dark"),
  past("tenet", "Tenet", 2020, ["Sci-Fi", "Action"], "balanced"),
  past("dune-2021", "Dune", 2021, ["Sci-Fi", "Drama"], "dark"),
  past("annihilation", "Annihilation", 2018, ["Sci-Fi", "Horror"], "dark"),
  past("her", "Her", 2013, ["Sci-Fi", "Romance"], "balanced"),
  past("moon", "Moon", 2009, ["Sci-Fi", "Drama"], "balanced"),
  past("contact", "Contact", 1997, ["Sci-Fi", "Drama"], "balanced"),
  past("the-matrix", "The Matrix", 1999, ["Sci-Fi", "Action"], "dark"),
  past("gattaca", "Gattaca", 1997, ["Sci-Fi", "Drama"], "balanced"),
  past("eternal-sunshine", "Eternal Sunshine of the Spotless Mind", 2004, ["Romance", "Sci-Fi"], "balanced"),
  past("minority-report", "Minority Report", 2002, ["Sci-Fi", "Thriller"], "balanced"),
  past("district-9", "District 9", 2009, ["Sci-Fi", "Action"], "dark"),
  past("looper", "Looper", 2012, ["Sci-Fi", "Action"], "dark"),
  past("children-of-men", "Children of Men", 2006, ["Sci-Fi", "Drama"], "dark"),
  past("2001", "2001: A Space Odyssey", 1968, ["Sci-Fi"], "balanced"),
  past("source-code", "Source Code", 2011, ["Sci-Fi", "Thriller"], "balanced"),
  past("the-social-network", "The Social Network", 2010, ["Drama"], "balanced"),
  past("gravity", "Gravity", 2013, ["Sci-Fi", "Thriller"], "balanced"),
  past("predestination", "Predestination", 2014, ["Sci-Fi", "Thriller"], "dark"),
  past("ready-player-one", "Ready Player One", 2018, ["Sci-Fi", "Action"], "light"),
  past("primer", "Primer", 2004, ["Sci-Fi", "Thriller"], "balanced"),

  // Jordan — horror
  past("the-conjuring", "The Conjuring", 2013, ["Horror"], "dark"),
  past("the-conjuring-2", "The Conjuring 2", 2016, ["Horror"], "dark"),
  past("insidious", "Insidious", 2010, ["Horror"], "dark"),
  past("sinister", "Sinister", 2012, ["Horror", "Thriller"], "dark"),
  past("it-2017", "It", 2017, ["Horror"], "dark"),
  past("the-ring", "The Ring", 2002, ["Horror", "Thriller"], "dark"),
  past("annabelle-creation", "Annabelle: Creation", 2017, ["Horror"], "dark"),
  past("the-exorcist", "The Exorcist", 1973, ["Horror"], "dark"),
  past("halloween-1978", "Halloween", 1978, ["Horror", "Thriller"], "dark"),
  past("scream", "Scream", 1996, ["Horror", "Comedy"], "balanced"),
  past("the-babadook", "The Babadook", 2014, ["Horror", "Drama"], "dark"),
  past("the-witch", "The Witch", 2015, ["Horror", "Fantasy"], "dark", "English", "A24"),
  past("us", "Us", 2019, ["Horror", "Thriller"], "dark"),
  past("midsommar", "Midsommar", 2019, ["Horror", "Drama"], "dark", "English", "A24"),
  past("smile", "Smile", 2022, ["Horror", "Thriller"], "dark"),
  past("barbarian", "Barbarian", 2022, ["Horror", "Thriller"], "dark"),
  past("nope", "Nope", 2022, ["Horror", "Sci-Fi"], "dark"),
  past("it-follows", "It Follows", 2014, ["Horror"], "dark"),
  past("the-shining", "The Shining", 1980, ["Horror"], "dark"),
  past("saw", "Saw", 2004, ["Horror", "Thriller"], "dark"),
  past("the-others", "The Others", 2001, ["Horror", "Drama"], "dark"),
  past("evil-dead-rise", "Evil Dead Rise", 2023, ["Horror"], "dark"),

  // Sofia — thrillers & world cinema
  past("se7en", "Se7en", 1995, ["Crime", "Thriller"], "dark"),
  past("shutter-island", "Shutter Island", 2010, ["Thriller", "Drama"], "dark"),
  past("silence-of-the-lambs", "The Silence of the Lambs", 1991, ["Thriller", "Crime"], "dark"),
  past("memento", "Memento", 2000, ["Thriller", "Crime"], "dark"),
  past("mother-2009", "Mother", 2009, ["Crime", "Drama"], "dark", "Korean"),
  past("the-handmaiden", "The Handmaiden", 2016, ["Thriller", "Romance"], "dark", "Korean"),
  past("burning", "Burning", 2018, ["Thriller", "Drama"], "dark", "Korean"),
  past("decision-to-leave", "Decision to Leave", 2022, ["Thriller", "Romance"], "balanced", "Korean"),
  past("pans-labyrinth", "Pan's Labyrinth", 2006, ["Fantasy", "Drama"], "dark", "Spanish"),
  past("secret-in-their-eyes", "The Secret in Their Eyes", 2009, ["Crime", "Thriller"], "dark", "Spanish"),
  past("wild-tales", "Wild Tales", 2014, ["Comedy", "Thriller"], "dark", "Spanish"),
  past("city-of-god", "City of God", 2002, ["Crime", "Drama"], "dark", "Portuguese"),
  past("amores-perros", "Amores Perros", 2000, ["Drama", "Crime"], "dark", "Spanish"),
  past("incendies", "Incendies", 2010, ["Drama", "Thriller"], "dark", "French"),
  past("drive", "Drive", 2011, ["Crime", "Thriller"], "dark"),
  past("no-country", "No Country for Old Men", 2007, ["Crime", "Thriller"], "dark"),
  past("sicario", "Sicario", 2015, ["Thriller", "Crime"], "dark"),
  past("fight-club", "Fight Club", 1999, ["Drama", "Thriller"], "dark"),
  past("dragon-tattoo", "The Girl with the Dragon Tattoo", 2011, ["Crime", "Thriller"], "dark"),
  past("uncut-gems", "Uncut Gems", 2019, ["Crime", "Thriller"], "dark", "English", "A24"),
  past("wind-river", "Wind River", 2017, ["Crime", "Thriller"], "dark"),
  past("the-lives-of-others", "The Lives of Others", 2006, ["Drama", "Thriller"], "dark", "German"),

  // Riya & kids — family animation
  past("toy-story", "Toy Story", 1995, ["Animation", "Comedy"], "light", "English", "Pixar"),
  past("finding-nemo", "Finding Nemo", 2003, ["Animation", "Comedy"], "light", "English", "Pixar"),
  past("up", "Up", 2009, ["Animation", "Drama"], "light", "English", "Pixar"),
  past("zootopia", "Zootopia", 2016, ["Animation", "Comedy"], "light", "English", "Disney"),
  past("frozen", "Frozen", 2013, ["Animation", "Fantasy"], "light", "English", "Disney"),
  past("moana", "Moana", 2016, ["Animation", "Fantasy"], "light", "English", "Disney"),
  past("totoro", "My Neighbor Totoro", 1988, ["Animation", "Fantasy"], "light", "Japanese", "Studio Ghibli"),
  past("ponyo", "Ponyo", 2008, ["Animation", "Fantasy"], "light", "Japanese", "Studio Ghibli"),
  past("kung-fu-panda", "Kung Fu Panda", 2008, ["Animation", "Action"], "light"),
  past("shrek", "Shrek", 2001, ["Animation", "Comedy"], "light"),
  past("httyd", "How to Train Your Dragon", 2010, ["Animation", "Fantasy"], "light"),
  past("ratatouille", "Ratatouille", 2007, ["Animation", "Comedy"], "light", "English", "Pixar"),
  past("wall-e", "WALL·E", 2008, ["Animation", "Sci-Fi"], "light", "English", "Pixar"),
  past("the-lion-king", "The Lion King", 1994, ["Animation", "Drama"], "light", "English", "Disney"),
  past("paddington-2", "Paddington 2", 2017, ["Comedy", "Fantasy"], "light"),
  past("encanto", "Encanto", 2021, ["Animation", "Fantasy"], "light", "English", "Disney"),
  past("luca", "Luca", 2021, ["Animation", "Comedy"], "light", "English", "Pixar"),
  past("inside-out", "Inside Out", 2015, ["Animation", "Comedy"], "light", "English", "Pixar"),
  past("despicable-me", "Despicable Me", 2010, ["Animation", "Comedy"], "light"),
  past("big-hero-6", "Big Hero 6", 2014, ["Animation", "Superhero"], "light", "English", "Disney"),
  past("the-incredibles", "The Incredibles", 2004, ["Animation", "Superhero"], "light", "English", "Pixar"),
  past("turning-red", "Turning Red", 2022, ["Animation", "Comedy"], "light", "English", "Pixar"),

  // Chloe — rom-coms & feel-good
  past("crazy-rich-asians", "Crazy Rich Asians", 2018, ["Romance", "Comedy"], "light"),
  past("notting-hill", "Notting Hill", 1999, ["Romance", "Comedy"], "light"),
  past("love-actually", "Love Actually", 2003, ["Romance", "Comedy"], "light"),
  past("10-things", "10 Things I Hate About You", 1999, ["Romance", "Comedy"], "light"),
  past("the-proposal", "The Proposal", 2009, ["Romance", "Comedy"], "light"),
  past("pride-prejudice", "Pride & Prejudice", 2005, ["Romance", "Drama"], "light"),
  past("mamma-mia", "Mamma Mia!", 2008, ["Comedy", "Romance"], "light"),
  past("legally-blonde", "Legally Blonde", 2001, ["Comedy"], "light"),
  past("when-harry-met-sally", "When Harry Met Sally...", 1989, ["Romance", "Comedy"], "light"),
  past("pretty-woman", "Pretty Woman", 1990, ["Romance", "Comedy"], "light"),
  past("devil-wears-prada", "The Devil Wears Prada", 2006, ["Comedy", "Drama"], "light"),
  past("clueless", "Clueless", 1995, ["Comedy", "Romance"], "light"),
  past("bridget-jones", "Bridget Jones's Diary", 2001, ["Romance", "Comedy"], "light"),
  past("500-days", "500 Days of Summer", 2009, ["Romance", "Drama"], "balanced"),
  past("crazy-stupid-love", "Crazy, Stupid, Love.", 2011, ["Romance", "Comedy"], "light"),
  past("easy-a", "Easy A", 2010, ["Comedy", "Romance"], "light"),
  past("silver-linings", "Silver Linings Playbook", 2012, ["Romance", "Drama"], "balanced"),
  past("palm-springs", "Palm Springs", 2020, ["Romance", "Comedy"], "light"),
  past("always-be-my-maybe", "Always Be My Maybe", 2019, ["Romance", "Comedy"], "light", "English", "Netflix"),
  past("little-women", "Little Women", 2019, ["Drama", "Romance"], "light"),
  past("mean-girls", "Mean Girls", 2004, ["Comedy"], "light"),
  past("the-holiday", "The Holiday", 2006, ["Romance", "Comedy"], "light"),
];

export const ALL_MOVIES: Movie[] = [...CATALOG, ...ARCHIVE];
export const MOVIES_BY_ID: Record<string, Movie> = Object.fromEntries(ALL_MOVIES.map((mv) => [mv.id, mv]));

/** A viewer's own lane plus a few titles from elsewhere — real people don't watch one genre. */
function mix(from: string, own: number, extras: string[]) {
  const start = ARCHIVE.findIndex((mv) => mv.id === from);
  const lane = ARCHIVE.slice(start, start + own).map((mv) => mv.id);
  // Spread the extras evenly through the lane (history is most-recent-first).
  const total = lane.length + extras.length;
  const out: string[] = [];
  let e = 0;
  for (let k = 0; k < total; k++) {
    const extrasDue = Math.round(((k + 1) * extras.length) / total);
    out.push(e < extrasDue ? extras[e++] : lane[k - e]);
  }
  return out;
}

export const PROFILES: Profile[] = [
  {
    id: "alex",
    name: "Alex",
    tagline: "Marvel first, but up for anything",
    hue: 4,
    history: mix("iron-man", 12, ["inception", "se7en", "crazy-stupid-love", "the-matrix", "the-conjuring", "shrek", "drive", "district-9", "10-things", "ready-player-one"]),
  },
  { id: "emma", name: "Emma", tagline: "Big ideas, bigger universes", hue: 205, history: mix("inception", 17, ["silence-of-the-lambs", "the-babadook", "500-days", "the-incredibles", "drive"]) },
  { id: "jordan", name: "Jordan", tagline: "Lights off, volume up", hue: 280, history: mix("the-conjuring", 17, ["se7en", "annihilation", "deadpool", "shutter-island", "mean-girls"]) },
  { id: "chloe", name: "Chloe", tagline: "Rom-coms & feel-good nights", hue: 330, history: mix("crazy-rich-asians", 17, ["up", "her", "paddington-2", "the-avengers", "eternal-sunshine"]) },
  { id: "sophie", name: "Sophie", tagline: "Twisty thrillers, worldwide", hue: 42, history: mix("se7en", 17, ["inception", "the-prestige", "it-follows", "the-matrix", "her"]) },
  { id: "parkers", name: "The Parkers", tagline: "Family movie nights", hue: 150, history: mix("toy-story", 17, ["spider-man-homecoming", "mamma-mia", "the-avengers", "ready-player-one", "guardians-1"]) },
  { id: "new", name: "New viewer", tagline: "Pick three films to begin", hue: 190, history: [] },
];
