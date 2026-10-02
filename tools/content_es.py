# Spanish content (Latin American Spanish, es-MX audio). (spanish, english, category, gender m/f/None, levelA?)
# Nouns are listed with their definite article so gender is learned with the word.
W = []
def add(cat, items, a=()):
    for es, en in items:
        g = "m" if es.startswith(("el ", "los ")) else "f" if es.startswith(("la ", "las ")) else None
        if es == "el agua": g = "f*"  # feminine noun that uses el in the singular
        W.append(dict(es=es, en=en, cat=cat, g=g, a=es in a))
add("Numbers", [("uno","one"),("dos","two"),("tres","three"),("cuatro","four"),("cinco","five"),("seis","six"),("siete","seven"),("ocho","eight"),("nueve","nine"),("diez","ten"),
  ("once","eleven"),("doce","twelve"),("trece","thirteen"),("catorce","fourteen"),("quince","fifteen"),("dieciséis","sixteen"),("diecisiete","seventeen"),("dieciocho","eighteen"),("diecinueve","nineteen"),("veinte","twenty")],
  a=("uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez"))
add("Colors", [("rojo","red"),("azul","blue"),("amarillo","yellow"),("verde","green"),("anaranjado","orange"),("morado","purple"),("rosado","pink"),("blanco","white"),("negro","black"),("gris","gray"),("café","brown")],
  a=("rojo","azul","amarillo","verde","blanco","negro"))
add("Animals", [("el perro","dog"),("el gato","cat"),("el pájaro","bird"),("el pez","fish"),("el caballo","horse"),("la vaca","cow"),("el cerdo","pig"),("el conejo","rabbit"),("el oso","bear"),("el león","lion"),
  ("la tortuga","turtle"),("la rana","frog"),("el ratón","mouse"),("la mariposa","butterfly"),("el mono","monkey"),("la abeja","bee")],
  a=("el perro","el gato","el pájaro","el pez","el caballo","la vaca"))
add("Family", [("la mamá","mom"),("el papá","dad"),("el hermano","brother"),("la hermana","sister"),("el abuelo","grandpa"),("la abuela","grandma"),("el tío","uncle"),("la tía","aunt"),
  ("el primo","cousin (boy)"),("la prima","cousin (girl)"),("el bebé","baby"),("la familia","family")],
  a=("la mamá","el papá","el hermano","la hermana","el abuelo","la abuela"))
add("Food", [("la manzana","apple"),("el plátano","banana"),("la naranja","orange (fruit)"),("el pan","bread"),("el queso","cheese"),("la leche","milk"),("el agua","water"),("el arroz","rice"),
  ("el pollo","chicken"),("el huevo","egg"),("la sopa","soup"),("el helado","ice cream"),("la galleta","cookie"),("el jugo","juice"),("la fresa","strawberry"),("la zanahoria","carrot")],
  a=("la manzana","el plátano","el pan","la leche","el agua","el helado"))
add("School", [("la escuela","school"),("el libro","book"),("el lápiz","pencil"),("la mochila","backpack"),("el maestro","teacher (man)"),("la maestra","teacher (woman)"),("el papel","paper"),
  ("la mesa","table"),("la silla","chair"),("el cuaderno","notebook"),("las tijeras","scissors"),("la computadora","computer"),("el borrador","eraser"),("la clase","class")],
  a=("la escuela","el libro","el lápiz","la mochila"))
add("Body", [("la cabeza","head"),("los ojos","eyes"),("la nariz","nose"),("la boca","mouth"),("las orejas","ears"),("el pelo","hair"),("la mano","hand"),("el brazo","arm"),
  ("la pierna","leg"),("el pie","foot"),("el dedo","finger"),("los dientes","teeth"),("el estómago","stomach"),("la rodilla","knee")],
  a=("la cabeza","los ojos","la nariz","la boca","la mano","el pie"))
add("Describing words", [("grande","big"),("pequeño","small"),("feliz","happy"),("triste","sad"),("cansado","tired"),("rápido","fast"),("lento","slow"),("bonito","pretty"),
  ("caliente","hot"),("frío","cold"),("nuevo","new"),("viejo","old"),("alto","tall"),("bajo","short (height)"),("divertido","fun"),("enojado","angry")])
add("Action words", [("comer","to eat"),("beber","to drink"),("correr","to run"),("saltar","to jump"),("leer","to read"),("escribir","to write"),("jugar","to play"),("cantar","to sing"),
  ("bailar","to dance"),("dormir","to sleep"),("nadar","to swim"),("hablar","to speak"),("escuchar","to listen"),("mirar","to look"),("abrir","to open"),("cerrar","to close")])

PRON = [
 dict(title="The 5 vowels", tip="Spanish vowels are short and always sound the same.", items=[("a","ah, like in 'father'","agua"),("e","eh, like in 'pet'","elefante"),("i","ee, like in 'see'","isla"),("o","oh, short, like in 'go'","oso"),("u","oo, like in 'moon'","uva")]),
 dict(title="Ñ ñ", tip="Ñ sounds like 'ny' in 'canyon'.", items=[("ñ","ny","niño"),("ñ","ny","año"),("ñ","ny","piña"),("ñ","ny","señora")]),
 dict(title="RR rr", tip="RR is a rolled R: tap your tongue behind your top teeth, brrr! One R between vowels is a quick single tap.", items=[("rr","rolled","perro"),("rr","rolled","carro"),("r","rolled at the start","ratón"),("r","single tap","pero")]),
 dict(title="LL ll", tip="In most of Latin America, LL sounds like the 'y' in 'yes'.", items=[("ll","y","llama"),("ll","y","pollo"),("ll","y","lluvia"),("ll","y","calle")]),
 dict(title="H and J", tip="H is always silent. J sounds like a breathy 'h'.", items=[("h","silent","helado"),("h","silent","hola"),("j","breathy h","jugo"),("j","breathy h","jirafa")]),
 dict(title="Accent marks", tip="An accent mark shows which part of the word to say loudest: pa-PÁ. It can change the meaning!", items=[("á","stress here","papá"),("ó","stress here","canción"),("á","stress here","árbol"),("é","stress here","café")]),
]
# hear-and-pick minimal pairs (word, english)
PAIRS = [(("pero","but"),("perro","dog")),(("caro","expensive"),("carro","car")),(("papa","potato"),("papá","dad")),(("pena","sorrow"),("peña","rock")),
         (("cana","gray hair"),("caña","cane")),(("coro","choir"),("corro","I run"))]
PHRASES = [
("Greetings","¡Hola!","Hello!",True),("Greetings","Buenos días.","Good morning.",True),("Greetings","Buenas tardes.","Good afternoon.",False),("Greetings","Buenas noches.","Good night.",True),
("Greetings","¡Adiós!","Goodbye!",True),("Greetings","Hasta mañana.","See you tomorrow.",False),("Greetings","¿Cómo estás?","How are you?",True),("Greetings","Estoy bien, gracias.","I'm fine, thank you.",True),
("Courtesy","Por favor.","Please.",True),("Courtesy","Gracias.","Thank you.",True),("Courtesy","De nada.","You're welcome.",True),("Courtesy","Lo siento.","I'm sorry.",True),("Courtesy","Con permiso.","Excuse me.",False),
("About me","Me llamo Ana.","My name is Ana.",True),("About me","¿Cómo te llamas?","What's your name?",True),("About me","Tengo siete años.","I am seven years old.",True),("About me","¿Cuántos años tienes?","How old are you?",False),
("About me","Soy de Estados Unidos.","I am from the United States.",False),("About me","Mucho gusto.","Nice to meet you.",True),
("Questions","¿Dónde está el baño?","Where is the bathroom?",False),("Questions","¿Qué es esto?","What is this?",False),("Questions","¿Te gusta el helado?","Do you like ice cream?",False),
("Questions","¿Quieres jugar?","Do you want to play?",True),("Questions","¿Qué hora es?","What time is it?",False),("Questions","¿Cuál es tu color favorito?","What is your favorite color?",False),
]
VERBS = [
 dict(verb="ser", en="to be (who/what something is)", forms=[("yo","soy"),("tú","eres"),("él / ella","es"),("nosotros","somos"),("ellos / ellas","son")],
      ex=[("Yo soy alto.","I am tall."),("Ella es mi hermana.","She is my sister.")]),
 dict(verb="estar", en="to be (how or where something is)", forms=[("yo","estoy"),("tú","estás"),("él / ella","está"),("nosotros","estamos"),("ellos / ellas","están")],
      ex=[("Estoy cansado.","I am tired."),("El gato está en la mesa.","The cat is on the table.")]),
 dict(verb="tener", en="to have", forms=[("yo","tengo"),("tú","tienes"),("él / ella","tiene"),("nosotros","tenemos"),("ellos / ellas","tienen")],
      ex=[("Tengo un perro.","I have a dog."),("Ella tiene ocho años.","She is eight years old.")]),
 dict(verb="gustar", en="to like (literally 'to be pleasing')", forms=[("a mí","me gusta"),("a ti","te gusta"),("a él / ella","le gusta"),("a nosotros","nos gusta"),("a ellos / ellas","les gusta")],
      ex=[("Me gusta el helado.","I like ice cream."),("¿Te gustan los gatos?","Do you like cats?")]),
]
SER_ESTAR = [("Mi mamá ___ doctora.","es","ser: what someone is (a job)"),("Yo ___ feliz hoy.","estoy","estar: a feeling right now"),("El libro ___ en la mochila.","está","estar: where something is"),
             ("Nosotros ___ hermanos.","somos","ser: who we are"),("Tú ___ muy alto.","eres","ser: what someone is like"),("Ellos ___ cansados.","están","estar: how they feel now")]
SENTENCES = [  # Level B sentence listening
("El perro come pan.","The dog eats bread."),("Mi hermana tiene un gato negro.","My sister has a black cat."),("Me gusta jugar en el parque.","I like to play in the park."),
("La escuela es grande.","The school is big."),("Estoy cansado hoy.","I am tired today."),("Tenemos dos conejos.","We have two rabbits."),
("¿Dónde está mi mochila?","Where is my backpack?"),("El helado está frío.","The ice cream is cold."),("Mi abuelo lee un libro.","My grandpa reads a book."),("Ellos bailan y cantan.","They dance and sing."),
]
COUNTRIES = [("México","Mexico City","🇲🇽"),("España","Madrid","🇪🇸"),("Colombia","Bogotá","🇨🇴"),("Argentina","Buenos Aires","🇦🇷"),("Perú","Lima","🇵🇪"),("Chile","Santiago","🇨🇱"),
             ("Cuba","Havana","🇨🇺"),("Guatemala","Guatemala City","🇬🇹"),("Costa Rica","San José","🇨🇷"),("Venezuela","Caracas","🇻🇪")]
