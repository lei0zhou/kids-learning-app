# All passages, sentences and word lists below are original, written for this app.
# Question format: (type, question, [choices], correct_index, feedback, clue)
#   clue = exact substring of the passage that the feedback points back to (highlighted in the app).
PASSAGES = [
dict(id="snail", title="The Great Snail Race", grade=2, kind="Fiction", emoji="🐌", text=
"Mina found two snails on the wet sidewalk after the rain. She named them Zip and Slowpoke. "
"Mina drew a chalk line and a finish flag. \"Ready, set, go!\" she shouted. "
"Zip stretched his long neck and slid forward right away. Slowpoke did not move at all. He tucked into his shell. "
"Mina waited and waited. Then Slowpoke peeked out and began to glide. He left a shiny silver trail behind him. "
"Zip stopped to nibble a leaf. Slowpoke kept going, slow and steady. In the end, Slowpoke crossed the line first! "
"Mina laughed. \"I guess the name doesn't matter,\" she said. \"What matters is that you keep going.\"",
qs=[
("main idea","What is this story mostly about?",["Mina's chalk drawings","A snail race that the slow snail wins","How snails find food","A rainy day at school"],1,
 "The story follows the race from \"Ready, set, go!\" to the end, when Slowpoke wins.","In the end, Slowpoke crossed the line first!"),
("detail","When did Mina find the snails?",["Before school","After the rain","At night","On a sunny day"],1,
 "The very first sentence tells us.","Mina found two snails on the wet sidewalk after the rain."),
("vocabulary","\"Slowpoke began to glide.\" What does glide mean?",["Jump high","Move smoothly","Fall asleep","Shout loudly"],1,
 "Snails slide along smoothly, leaving a trail. That is gliding.","began to glide. He left a shiny silver trail"),
("inference","Why did Zip lose the race?",["He went the wrong way","He stopped to eat a leaf","He fell asleep in his shell","Mina picked him up"],1,
 "Zip stopped, but Slowpoke kept going.","Zip stopped to nibble a leaf."),
("sequence","What happened right after Mina shouted \"Go!\"?",["Slowpoke crossed the line","Zip slid forward","Mina drew a flag","Zip ate a leaf"],1,
 "Right after the shout, Zip slid forward right away.","Zip stretched his long neck and slid forward right away."),
]),
dict(id="bees", title="How Bees Make Honey", grade=2, kind="Nonfiction", emoji="🐝", text=
"Honey starts inside a flower. Many flowers make a sweet juice called nectar. "
"Worker bees fly from flower to flower and sip the nectar. They carry it home in a special pouch called a honey stomach. "
"Back at the hive, the bees pass the nectar to other bees. These bees put the nectar into tiny wax rooms called cells. "
"At first the nectar is runny and wet. So the bees fan it with their wings. The moving air dries the nectar until it becomes thick, sticky honey. "
"Last, the bees cover each cell with a lid of wax. The honey stays safe inside. In winter, when there are no flowers, the bees eat the honey they saved.",
qs=[
("main idea","What is the main idea?",["Bees can sting","Bees turn nectar into honey and save it","Flowers are pretty","Winter is cold"],1,
 "Every part of the passage explains a step in making honey.","Honey starts inside a flower."),
("detail","Where do bees carry nectar?",["In their legs","In a honey stomach","In a basket","In their wings"],1,
 "The passage names the special pouch.","They carry it home in a special pouch called a honey stomach."),
("vocabulary","What are cells in this passage?",["Tiny wax rooms","Phones","Flower petals","Baby bees"],0,
 "The passage explains the word right after using it.","tiny wax rooms called cells"),
("sequence","What do bees do right before they put a wax lid on the cell?",["Sip nectar","Fan the nectar with their wings","Find a flower","Eat the honey"],1,
 "They fan the nectar until it is thick. \"Last\" they add the lid.","So the bees fan it with their wings."),
("inference","Why do bees save honey?",["To give to bears","To have food when there are no flowers","To make wax","To stay warm in summer"],1,
 "The last sentence tells why the honey matters.","In winter, when there are no flowers, the bees eat the honey they saved."),
]),
dict(id="pip", title="Pip Learns to Wait", grade=2, kind="Fiction", emoji="🐶", text=
"Pip was a small brown puppy with very big ears. Every time the doorbell rang, Pip barked and jumped. "
"One day Leo held up a treat. \"Sit, Pip,\" he said softly. Pip wiggled. Pip wagged. At last, Pip sat. Leo gave him the treat. "
"Every afternoon they practiced. Leo rang the bell, and Pip tried to stay still. Some days Pip forgot and jumped anyway. Leo just smiled and tried again. "
"On Saturday, Grandma came to visit. Ding-dong! Pip's ears popped up. His tail thumped the floor. But he sat. "
"\"What a polite puppy!\" Grandma said. Pip felt so proud that his whole body wagged.",
qs=[
("main idea","What is the story mostly about?",["Grandma's visit","A puppy learning to sit and wait","Leo's birthday","How to ring a doorbell"],1,
 "Most of the story shows Leo and Pip practicing.","Every afternoon they practiced."),
("detail","What did Pip do when the doorbell rang at the beginning?",["Hid under the bed","Barked and jumped","Fell asleep","Sat quietly"],1,
 "Look at the second sentence.","Every time the doorbell rang, Pip barked and jumped."),
("vocabulary","Grandma called Pip polite. Polite means…",["Noisy","Having good manners","Very sleepy","Hungry"],1,
 "Pip sat nicely instead of jumping. That is good manners.","\"What a polite puppy!\""),
("inference","How did Leo feel when Pip forgot and jumped?",["Angry","Patient","Scared","Bored"],1,
 "Leo smiled and tried again. That shows patience.","Leo just smiled and tried again."),
]),
dict(id="mitten", title="The Lost Mitten", grade=3, kind="Fiction", emoji="🧤", text=
"On the walk home from school, Ava noticed that her left hand was freezing. Her red mitten was gone! "
"She traced her steps back past the bakery, the library, and the park. Snow had started to fall, and everything looked white. "
"At the park, she spotted something odd on the fence. A tiny snowman sat on the post, and it was wearing her red mitten like a hat. "
"Beside it was a note in wobbly letters: \"Found this. Our snowman was cold. Sorry! — Theo, age 6.\" "
"Ava giggled. She thought about taking the mitten back. Instead, she pulled a spare blue mitten from her backpack and put the red one in her pocket for later. "
"Then she drew a smiley face in the snow next to the note.",
qs=[
("main idea","Which sentence best tells the main idea?",["Ava likes the bakery","Ava searches for her mitten and finds a funny surprise","Snow is white","Theo builds a fort"],1,
 "The story is about the search and what she found at the park.","it was wearing her red mitten like a hat"),
("detail","Where did Ava find her mitten?",["At the library","On a snowman at the park","In her backpack","At the bakery"],1,
 "Reread the part about the fence.","A tiny snowman sat on the post, and it was wearing her red mitten like a hat."),
("vocabulary","\"She traced her steps back.\" Traced means…",["Drew a picture","Followed the same path again","Ran very fast","Forgot"],1,
 "She went back past the same places she had walked.","She traced her steps back past the bakery, the library, and the park."),
("inference","Who most likely wrote the note?",["Ava's teacher","A younger child named Theo","The baker","Ava"],1,
 "The note is signed, and the letters are wobbly like a young child's.","Theo, age 6."),
("sequence","What did Ava do LAST?",["Found the note","Drew a smiley face in the snow","Walked past the library","Noticed her cold hand"],1,
 "The final sentence tells her last action.","Then she drew a smiley face in the snow next to the note."),
]),
dict(id="octopus", title="The Octopus: Ocean Escape Artist", grade=3, kind="Nonfiction", emoji="🐙", text=
"The octopus may be the best hide-and-seek player in the sea. It has no bones at all, so its soft body can squeeze through any hole bigger than its hard beak. "
"An octopus can also change color in less than a second. Special cells in its skin let it turn red, brown, or even bumpy like a rock. This helps it hide from sharks and sneak up on crabs. "
"If a hungry fish gets too close, the octopus has one more trick. It squirts a cloud of dark ink and zooms away while the fish is confused. "
"Octopuses are smart, too. Scientists have watched them open jars to get food inside. "
"Here is one more surprising fact: an octopus has three hearts and blue blood!",
qs=[
("main idea","What is the main idea of this passage?",["Octopuses have many clever ways to hide and escape","Sharks are dangerous","Crabs live in the ocean","Jars are hard to open"],0,
 "Almost every paragraph describes a trick for hiding or escaping.","The octopus may be the best hide-and-seek player in the sea."),
("detail","Why can an octopus squeeze through small holes?",["It is very tiny","It has no bones","It has eight hearts","It is made of ink"],1,
 "The passage gives the reason in the first part.","It has no bones at all, so its soft body can squeeze through any hole"),
("vocabulary","\"…while the fish is confused.\" Confused means…",["Not sure what is happening","Very happy","Fast asleep","Very hungry"],0,
 "The ink cloud makes it hard for the fish to tell what happened.","while the fish is confused"),
("detail","How many hearts does an octopus have?",["One","Two","Three","Eight"],2,
 "Look at the surprising fact at the end.","an octopus has three hearts and blue blood"),
("inference","Why would changing color help an octopus catch crabs?",["Crabs like bright colors","The crab might not see it coming","Crabs are color-blind","It scares the crabs away"],1,
 "If the octopus blends in, it can get close without being seen.","sneak up on crabs"),
]),
dict(id="garden", title="Grandpa's Garden Map", grade=3, kind="Fiction", emoji="🥕", text=
"Grandpa unrolled a crinkly paper on the kitchen table. \"This is our garden map,\" he said. Squares were labeled carrots, beans, and sunflowers. "
"Jun pointed to an empty square in the corner. \"What goes here?\" "
"\"That one is yours,\" Grandpa said. \"You decide.\" "
"Jun thought all week. Tomatoes were tasty, but pumpkins were enormous. In the end, he picked pumpkins because he wanted one for Halloween. "
"Together they dug the soil, pressed in the flat white seeds, and watered them. Every morning Jun checked his square. For eight days, nothing happened. "
"On the ninth day, two tiny green leaves poked out of the dirt. Jun ran inside shouting. Grandpa grinned and added a small drawing of a pumpkin to the map.",
qs=[
("main idea","What is this story mostly about?",["Jun choosing and planting his own pumpkins","How to draw a map","Halloween costumes","Grandpa's kitchen"],0,
 "The story follows Jun from picking the empty square to the first leaves.","\"That one is yours,\" Grandpa said."),
("vocabulary","\"Pumpkins were enormous.\" Enormous means…",["Very small","Very big","Very sweet","Very old"],1,
 "Pumpkins are known for being huge, and the sentence compares them to small tomatoes.","pumpkins were enormous"),
("detail","Why did Jun choose pumpkins?",["Grandpa told him to","He wanted one for Halloween","They grow fastest","He doesn't like tomatoes"],1,
 "The story tells the reason directly.","he picked pumpkins because he wanted one for Halloween"),
("sequence","Put in order: What happened right after they watered the seeds?",["Jun checked his square every morning","Grandpa unrolled the map","Jun thought all week","Jun picked pumpkins"],0,
 "After planting and watering, Jun began checking every morning.","Every morning Jun checked his square."),
("inference","How did Jun feel when the leaves came up?",["Bored","Excited","Sad","Sleepy"],1,
 "He ran inside shouting. People do that when they are excited.","Jun ran inside shouting."),
]),
dict(id="leaves", title="Why Leaves Change Color", grade=4, kind="Nonfiction", emoji="🍁", text=
"In summer, most tree leaves are green. The green comes from chlorophyll, a substance that helps leaves turn sunlight, water, and air into food for the tree. "
"Leaves also contain yellow and orange colors. All summer, these colors are hidden because there is so much green chlorophyll covering them up. "
"In autumn, the days grow shorter and the nights grow cooler. Trees sense this change and stop making new chlorophyll. As the green fades, the yellow and orange that were there all along finally show through. "
"Some trees, such as many maples, also make brand-new red and purple colors in the fall. "
"Eventually, a thin layer forms where each leaf joins its branch, and the leaf drops. The tree rests through winter and grows fresh green leaves in spring.",
qs=[
("main idea","What does this passage mainly explain?",["How to rake leaves","Why leaves change color in the fall","Why trees need water","How to plant a maple"],1,
 "The passage explains each cause of the color change.","As the green fades, the yellow and orange that were there all along finally show through."),
("vocabulary","Which phrase helps you understand what chlorophyll is?",["a substance that helps leaves turn sunlight, water, and air into food","the nights grow cooler","the leaf drops","fresh green leaves"],0,
 "The words right after \"chlorophyll\" define it.","a substance that helps leaves turn sunlight, water, and air into food for the tree"),
("detail","What signal tells trees that autumn is coming?",["More rain","Shorter days and cooler nights","Birds flying south","Snow on the ground"],1,
 "Reread the third paragraph.","the days grow shorter and the nights grow cooler"),
("inference","The yellow color in fall leaves is…",["Painted on by frost","Made new each fall","There all summer, but hidden","From the soil"],2,
 "The passage says these colors were \"there all along.\"","these colors are hidden because there is so much green chlorophyll"),
("sequence","Which happens LAST?",["The tree stops making chlorophyll","The leaf drops","The green fades","Days grow shorter"],1,
 "The leaf dropping comes near the end, after the color change.","the leaf drops"),
]),
dict(id="power", title="The Night the Lights Went Out", grade=4, kind="Fiction", emoji="🕯️", text=
"Thunder boomed, and the house went completely dark. Sam's tablet screen glowed for a moment, then the battery warning flashed and it shut off too. "
"\"Now what?\" Sam groaned. \"There's nothing to do.\" "
"Mom found a flashlight and some candles in a jar. Dad dug out an old board game with a box held together by tape. "
"At first Sam rolled his eyes. But by the second round, he was laughing so hard his stomach hurt, because Dad kept landing on the same unlucky square. "
"Later, Mom showed him how to make shadow animals on the wall with his hands. Sam invented a rabbit that could wiggle one ear. "
"When the lights flickered back on near midnight, everyone blinked. Sam looked at the glowing kitchen and said, \"Can we turn them off again?\"",
qs=[
("main idea","What is the theme (big lesson) of this story?",["Storms are scary","You can have fun without screens","Board games are old","Candles are bright"],1,
 "Sam starts bored without his tablet but ends up wanting the lights off again.","\"Can we turn them off again?\""),
("detail","Why did Sam's tablet stop working?",["It got wet","Its battery ran out","Dad took it","It broke in the storm"],1,
 "Look at the first paragraph.","the battery warning flashed and it shut off too"),
("vocabulary","\"Sam rolled his eyes.\" This shows he felt…",["Excited","Not interested","Scared","Sleepy"],1,
 "Rolling your eyes usually means you think something will be boring.","At first Sam rolled his eyes."),
("inference","Why did Sam ask to turn the lights off again?",["He was tired","He enjoyed the evening with his family","The lights hurt his eyes","He wanted to save money"],1,
 "He had been laughing and inventing shadow animals.","he was laughing so hard his stomach hurt"),
("sequence","Which happened FIRST?",["Shadow animals","The board game","The house went dark","The lights came back"],2,
 "The story begins with the thunder and the dark house.","Thunder boomed, and the house went completely dark."),
]),
dict(id="beaver", title="Busy Beavers", grade=4, kind="Nonfiction", emoji="🦫", text=
"Beavers are nature's engineers. Using only their teeth and paws, they cut down trees and build dams across streams. "
"A beaver's front teeth never stop growing, so chewing wood keeps them from getting too long. The teeth are orange because they contain iron, which makes them extra strong. "
"A dam blocks the flowing water and creates a calm, deep pond. In the middle of the pond, beavers build a home called a lodge out of sticks and mud. "
"The entrance to the lodge is underwater. This keeps out wolves and other predators that cannot swim in. "
"When a beaver senses danger, it slaps its flat tail on the water with a loud SMACK. The sound warns the whole family to dive. "
"Beaver ponds also give homes to fish, frogs, ducks, and insects, so one busy family can help a whole community of animals.",
qs=[
("main idea","What is the main idea?",["Beavers build dams and lodges that help them and other animals","Wolves can't swim","Iron is strong","Ducks like ponds"],0,
 "The passage describes how beavers build and how that helps others.","Beavers are nature's engineers."),
("vocabulary","What does predators mean in this passage?",["Animals that hunt other animals","Baby beavers","Trees","Fish in the pond"],0,
 "Wolves are given as an example, and the lodge keeps them out.","wolves and other predators"),
("detail","Why are beaver teeth orange?",["They eat carrots","They contain iron","They are dirty","They are painted by mud"],1,
 "The passage explains the color.","The teeth are orange because they contain iron"),
("inference","Why is an underwater entrance a smart idea?",["It keeps the lodge cool","Animals that can't swim can't get in","Beavers can't walk","It makes the pond deeper"],1,
 "The passage says it keeps out predators that cannot swim in.","This keeps out wolves and other predators that cannot swim in."),
("detail","What does the tail slap do?",["Catches fish","Warns the family to dive","Builds the dam","Cuts trees"],1,
 "Reread the part about danger.","The sound warns the whole family to dive."),
]),
]

# Vocabulary: word, kid-friendly meaning, original context sentence (with ___ for the word)
VOCAB = [
("brave","not afraid to do something hard or scary","The ___ firefighter climbed the tall ladder."),
("curious","wanting to know or learn about something","The ___ kitten sniffed every box in the room."),
("enormous","very, very big","An ___ whale swam under our tiny boat."),
("fragile","easy to break","Carry the glass bowl carefully because it is ___."),
("gigantic","huge; much bigger than usual","The ___ sandwich was taller than my water bottle."),
("glance","a quick look","She took one ___ at the clock and ran out the door."),
("grateful","feeling thankful","I felt ___ when my friend shared her umbrella."),
("hesitate","to pause before doing something because you are unsure","Don't ___ to ask for help if you get stuck."),
("journey","a long trip from one place to another","The geese began their ___ south for the winter."),
("ancient","very, very old","We saw ___ pots that were thousands of years old."),
("cautious","careful to avoid danger","The ___ deer stepped slowly toward the road."),
("delicious","tasting very good","Grandma's soup was so ___ that I asked for more."),
("exhausted","very, very tired","After the long hike, we were ___ and fell asleep fast."),
("furious","very angry","The cat was ___ when the dog stole its bed."),
("gather","to bring things together in one place","Let's ___ the crayons and put them in the box."),
("investigate","to look closely to find out the truth","The detective came to ___ the missing cookies."),
("predict","to guess what will happen next","Can you ___ how the story will end?"),
("scurry","to move quickly with small steps","The mice ___ under the shed when the light turns on."),
("timid","shy and easily frightened","The ___ puppy hid behind the couch when guests arrived."),
("vanish","to disappear suddenly","The magician made the coin ___ from his hand."),
]
SYN = [  # (word, synonym, [distractors])
("happy","glad",["angry","tired"]),("big","large",["tiny","slow"]),("fast","quick",["late","soft"]),("smart","clever",["silly","loud"]),
("begin","start",["finish","stop"]),("shout","yell",["whisper","sleep"]),("tired","sleepy",["awake","hungry"]),("scared","afraid",["brave","calm"]),
("simple","easy",["hard","heavy"]),("look","see",["hear","run"]),("unhappy","sad",["cheerful","funny"]),("quiet","silent",["noisy","bright"]),
]
ANT = [
("hot","cold",["warm","sunny"]),("open","closed",["wide","empty"]),("early","late",["soon","first"]),("full","empty",["heavy","round"]),
("float","sink",["swim","drift"]),("ancient","modern",["old","broken"]),("brave","cowardly",["bold","strong"]),("rough","smooth",["bumpy","hard"]),
("whisper","shout",["murmur","talk"]),("arrive","leave",["reach","enter"]),("noisy","quiet",["loud","busy"]),("generous","selfish",["kind","giving"]),
]

# Spelling lists: (word, original example sentence)
SPELL = [
dict(id="short", title="Short vowels & digraphs", grade=2, pattern="Short vowel sounds and sh, ch, th, ck",
 words=[("ship","The ship sailed across the bay."),("chip","I dropped a potato chip."),("thick","The book is very thick."),("duck","A duck paddled in the pond."),
        ("fish","My fish swims in circles."),("lunch","We ate lunch outside."),("path","Follow the path to the lake."),("clock","The clock says three o'clock.")]),
dict(id="silente", title="Magic E (silent e)", grade=2, pattern="A silent e at the end makes the vowel say its name",
 words=[("cake","We baked a cake for Mom."),("bike","I ride my bike to the park."),("home","It is time to go home."),("cube","An ice cube melted in my cup."),
        ("smile","Her smile made me happy."),("stone","He skipped a stone on the water."),("plane","The plane flew over the clouds."),("rope","We jumped rope at recess.")]),
dict(id="teams", title="Vowel teams", grade=3, pattern="Two vowels together: ai, ay, ee, ea, oa, ow",
 words=[("rain","The rain tapped on the window."),("play","Can you play after school?"),("green","The grass is green."),("beach","We built a castle at the beach."),
        ("boat","The boat bobbed on the waves."),("snow","Snow covered the yard."),("train","The train whistled loudly."),("dream","I had a dream about dragons.")]),
dict(id="rcontrol", title="Bossy R", grade=3, pattern="ar, or, er, ir, ur",
 words=[("star","A bright star twinkled."),("storm","The storm knocked out the power."),("bird","A bird built a nest."),("turn","Turn left at the corner."),
        ("her","I gave her a card."),("shark","The shark swam fast."),("first","She was first in line."),("horse","The horse ate an apple.")]),
dict(id="endings", title="Adding -ing and -ed", grade=3, pattern="Double the last letter after a short vowel; drop the silent e",
 words=[("running","The dog is running in circles."),("hopped","The bunny hopped away."),("making","We are making pancakes."),("swimming","I love swimming in the lake."),
        ("smiled","She smiled at the baby."),("stopped","The bus stopped at the corner."),("riding","He is riding a pony."),("planned","We planned a picnic.")]),
dict(id="tricky", title="Tricky words", grade=4, pattern="Words that don't follow the rules, so memorize them",
 words=[("because","I wore boots because it was muddy."),("friend","My friend shares her markers."),("said","Dad said it was bedtime."),("people","Many people came to the fair."),
        ("again","Let's read that book again."),("beautiful","The sunset was beautiful."),("enough","Do we have enough chairs?"),("different","Each snowflake is different.")]),
]

# Sentence building (tiles): correct sentence; tiles are its words, shuffled in the app.
SENTENCES = [
"The cat sat on the mat.","My dog likes to dig holes.","We read a book at bedtime.","The red kite flew over the hill.",
"Can you help me find my shoe?","Birds build nests in the spring.","Sara and Ben played tag at recess.","The hungry bear ate sweet berries.",
"Please close the door when you leave.","My little brother lost his first tooth.","What time does the movie start?","The tall giraffe ate leaves from the tree.",
]
# Capitalization/punctuation fixes: (wrong, right). Kid taps words to capitalize and chooses the end mark.
FIXES = [
("my friend lives in texas","My friend lives in Texas."),
("do you like pizza","Do you like pizza?"),
("on monday we went to the zoo","On Monday we went to the zoo."),
("wow, that was a huge wave","Wow, that was a huge wave!"),
("i visited aunt rosa in july","I visited Aunt Rosa in July."),
("where is the library","Where is the library?"),
("max and i saw a bald eagle","Max and I saw a bald eagle."),
("we sailed on lake michigan","We sailed on Lake Michigan."),
("watch out for the ball","Watch out for the ball!"),
("did dr. lee check your teeth","Did Dr. Lee check your teeth?"),
]
