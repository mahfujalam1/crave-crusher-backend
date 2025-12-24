import { Types } from 'mongoose';

export enum AddictionType {
    SMOKING_DETOX = 'Smoking Detox',
    SAVING_MONEY_BATTLE = 'Saving Money Battle',
    SOCIAL_MEDIA_DETOX = 'Social Media Detox',
    TOXIC_RELATIONSHIP_BATTLE = 'Toxic Relationship Battle',
    SHOPPING_DETOX = 'Shopping Detox',
    JUNK_FOOD_BATTLE = 'Junk Food Battle'
}

export enum AddictionLevel {
    VERY_LOW = 'Very Low',
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    VERY_HIGH = 'Very High'
}

export enum BattleStatus {
    ACTIVE = 'active',
    COMPLETE = 'complete',
    CANCEL = 'cancel'
}


export interface IBattle {
    userId: Types.ObjectId;
    addictionType: AddictionType;
    addictionLevel: AddictionLevel;
    battleLength: number;
    day: number;
    sendReminder: boolean;
    battleReason: string;
    battleProgress: number;
    battleStatus: BattleStatus;
    totalCrave: number;
    runningDay?: number;
    isDeleted: boolean;
    lastCheckInAt: Date | null;
    lastCheckInStatus: 'craved' | 'caved' | null;
}


export const monster_messages = {
    [AddictionType.SMOKING_DETOX]: [
        { day: 1, message: "Drink water and go for a short walk to ease the initial cravings." },
        { day: 2, message: "Savor your food and reflect on this positive change." },
        { day: 3, message: "Drink Lemon water, deep breathe, or distract yourself with a puzzle." },
        { day: 4, message: "Use a humidifier and hydrate to help the lungs." },
        { day: 5, message: "Do light exercise and focus on your breath." },
        { day: 6, message: "Practice mindfulness and get rest when needed." },
        { day: 7, message: "Celebrate with a deep breath and affirm your progress." },
        { day: 10, message: "Stretch or journal to express emotions." },
        { day: 14, message: "Track your breathing and note improvement." },
        { day: 30, message: "Enjoy skin-care or light cardio to boost circulation." }
    ],
    [AddictionType.SOCIAL_MEDIA_DETOX]: [
        { day: 1, message: "Uninstall social apps and schedule a tech-free day." },
        { day: 2, message: "Keep your phone in another room and use a watch instead." },
        { day: 3, message: "Replace scrolling with journalism or reading something uplifting." },
        { day: 4, message: "Establish a calming evening routine to unwind without screens." },
        { day: 5, message: "Use a task list app and reward your productivity." },
        { day: 6, message: "Create a content-free zone in your environment." },
        { day: 7, message: "Reflect on your screen-time goals and progress." },
        { day: 10, message: "Take a break for a walk and reset your mind." },
        { day: 14, message: "Journal about the impact of social media on your life." },
        { day: 30, message: "Celebrate with a day of relaxation and self-care." }
    ],
    [AddictionType.SHOPPING_DETOX]: [
        { day: 1, message: "Avoid online stores and replace browsing with budgeting apps." },
        { day: 2, message: "Practice gratitude journaling or clean your space for a dopamine boost." },
        { day: 3, message: "Create a 30-day wishlist delay rule." },
        { day: 4, message: "Celebrate your control with a non-shopping reward (like a walk)." },
        { day: 5, message: "Create a 'no-buy' challenge group for motivation." },
        { day: 6, message: "Journal about emotions tied to buying urges." },
        { day: 7, message: "Review your bank account and list savings goals." },
        { day: 10, message: "Create a vision board for what you're saving toward." },
        { day: 14, message: "Do something generous or donate items you no longer use." },
        { day: 30, message: "Set a milestone savings goal and treat yourself responsibly." }
    ],
    [AddictionType.SAVING_MONEY_BATTLE]: [
        { day: 1, message: "Sleep and hydrate. Seek support from a sponsor or group." },
        { day: 2, message: "Warm showers and light stretching. Remind yourself this is temporary." },
        { day: 3, message: "Use meditation or music therapy to ease emotional storms." },
        { day: 4, message: "Call a trusted support person and avoid triggers." },
        { day: 5, message: "Drink water and plan a simple walk to boost circulation." },
        { day: 6, message: "Establish bedtime rituals and cut caffeine." },
        { day: 7, message: "Begin journaling or use an addiction tracker app." },
        { day: 10, message: "Eat healthy snacks and avoid isolation." },
        { day: 14, message: "Use exercise or creative hobbies to channel new energy." },
        { day: 30, message: "Start a journal of wins and reminders of your progress." }
    ],
    [AddictionType.JUNK_FOOD_BATTLE]: [
        { day: 1, message: "Eat protein and fiber-rich snacks to regulate sugar levels." },
        { day: 2, message: "Go for a walk and drink lemon water to boost circulation." },
        { day: 3, message: "Replace sugary snacks with fruit and cinnamon-infused water." },
        { day: 4, message: "Eat slowly and note improvements in digestion." },
        { day: 5, message: "Do gentle movement like yoga or walking." },
        { day: 6, message: "Remind yourself of your progress and focus on the benefits." },
        { day: 7, message: "Celebrate your control with a healthy non-sugar treat." },
        { day: 10, message: "Journal your cravings and how you overcame them." },
        { day: 14, message: "Stay hydrated and maintain consistent meals." },
        { day: 30, message: "Enjoy a balanced lifestyle and reflect on your journey." }
    ],
    [AddictionType.TOXIC_RELATIONSHIP_BATTLE]: [
        { day: 1, message: "Write a list of reasons you left. Call a trusted friend." },
        { day: 2, message: "Block contact and read affirmations or breakup mantras." },
        { day: 3, message: "Schedule a self-care day with a safe person or therapist." },
        { day: 4, message: "Talk to a counselor or use a breakup workbook." },
        { day: 5, message: "Remind yourself you don’t need external validation to be happy." },
        { day: 6, message: "Reframe thoughts and focus on your own well-being." },
        { day: 7, message: "Celebrate your strength and progress in healing." },
        { day: 10, message: "Reflect on your self-worth and reaffirm healthy boundaries." },
        { day: 14, message: "Stay connected with supportive people and avoid triggers." },
        { day: 30, message: "Take time to enjoy hobbies and rediscover passions." }
    ]
};