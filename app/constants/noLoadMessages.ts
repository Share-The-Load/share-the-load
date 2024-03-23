const noLoadMessages = [
    "No laundry today? Time to make some dirty plans!",
    "No loads on the horizon. Guess it's time to unleash the sock monster!",
    "Zero loads? Looks like it's a 'fold-your-own-adventure' kind of day!",
    "No laundry? Perfect time to practice your shirt-folding origami skills!",
    "No loads in sight. Time to switch gears and embrace the wrinkle rebellion!",
    "No laundry scheduled. Let's make today a wrinkle-free zone... for now!",
    "Zero loads queued up. Who knew laundry could be so rebellious?",
    "No laundry today? It's a sign to seize the day... and maybe a stray sock or two.",
    "No laundry, no problem! Time to air out your laundry pun collection instead!",
    "Zero loads ahead. Guess it's a day for wardrobe roulette!",
    "No laundry in sight. Maybe it's time to let loose and wear mismatched socks!",
    "No loads scheduled. It's a laundry liberation day – live dangerously!",
    "Zero loads waiting. Time to kick back and let the lint settle!",
    "No laundry today? Seize the moment and celebrate with a lint roller parade!",
    "No loads in the lineup. Embrace the freedom and dive into the sock drawer abyss!",
    "No laundry? It's a rare chance to embrace the wild side of the laundry room.",
    "No loads on the docket. Time to channel your inner laundry rebel!",
    "Zero loads, maximum freedom! Let the wrinkle revolution begin!",
    "No laundry on the horizon. Grab a snack, sit back, and enjoy the spin cycle of life!",
    "No loads scheduled. Time to declare independence from the tyranny of socks!",
    "No laundry today? Let's embrace the freedom and dance like nobody's watching... in our favorite unironed shirt!",
    "Zero loads? Time to fluff up your imagination and dream of laundry adventures!",
    "No laundry scheduled. Don't worry, the sock monster is on vacation too!",
    "No loads on the agenda. Seize the opportunity to air out your laundry jokes instead!",
    "No laundry today? Maybe it's a sign to treat yourself to a spontaneous sock puppet show!",
    "Zero loads queued up. It's a rare chance to explore the untouched realms of the laundry basket!",
    "No laundry in sight. Let's celebrate by wearing our comfiest, most questionable pajamas all day!",
    "No laundry? Sounds like the perfect excuse to host a 'mismatched sock party'!",
    "Zero loads waiting. Time to roll up your sleeves and embark on a quest to find the missing sock!",
    "No laundry today? Enjoy the moment and savor the sweet scent of laundry room freedom!",
    "No loads on the horizon. Who needs clean clothes when you have a wardrobe full of personality?",
    "No laundry scheduled. Embrace the chaos and revel in the glory of unfolded socks!",
    "Zero loads? It's like a holiday for your washing machine – let's give it a break!",
    "No laundry in the lineup. Time to kick back, relax, and let the lint fly where it may!",
    "No laundry? Let's celebrate by tossing caution to the wind and wearing our favorite 'inside-out' shirts!",
    "Zero loads on deck. Take a moment to appreciate the uncharted territory of an empty laundry basket!",
    "No laundry today? It's a rare chance to ponder life's mysteries while staring into the depths of the dryer lint trap!",
    "No loads scheduled. Grab a cup of coffee, sit back, and enjoy the suspenseful spin cycle of life!",
    "No laundry? Let's raise a toast to the unsung heroes of the laundry room – the single socks!",
    "Zero loads waiting. Time to embrace the zen of laundry-free living and bask in the glory of wrinkle defiance!",
    "No loads scheduled. Grab life by the laundry basket and get something on the books",
]

export const getRandomNoLoadMessage = () => {
    return noLoadMessages[Math.floor(Math.random() * noLoadMessages.length)]
}