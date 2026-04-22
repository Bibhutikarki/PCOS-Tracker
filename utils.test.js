const { differenceInDays, format, parseISO } = require('date-fns');

describe('MERN Health Tracking App - Utility & Logic Tests', () => {

    // 1. Validate name minimum length (>=2 characters)
    test('should validate name minimum length of at least 2 characters', () => {
        const validateName = (name) => name.trim().length >= 2;
        expect(validateName('A')).toBe(false);
        expect(validateName('Jo')).toBe(true);
        expect(validateName('Jane')).toBe(true);
    });

    // 2. Validate password minimum length (>=6 characters)
    test('should validate password minimum length of 6 characters', () => {
        const validatePassword = (pwd) => pwd.length >= 6;
        expect(validatePassword('12345')).toBe(false);
        expect(validatePassword('123456')).toBe(true);
    });

    // 3. Validate password confirmation match
    test('should validate that password and confirm password match', () => {
        const validateMatch = (pwd, confirmPwd) => pwd === confirmPwd;
        expect(validateMatch('password123', 'password123')).toBe(true);
        expect(validateMatch('password123', 'password124')).toBe(false);
    });

    // 4. Calculate average severity from an object map
    test('should calculate average severity correctly from an object map', () => {
        const calculateAvgSeverity = (severityMap) => {
            const values = Object.values(severityMap);
            if (values.length === 0) return 0;
            return values.reduce((acc, curr) => acc + curr, 0) / values.length;
        };
        const severityMap = { Pain: 4, Bloating: 2, Fatigue: 3 };
        expect(calculateAvgSeverity(severityMap)).toBe(3); // (4 + 2 + 3) / 3
        expect(calculateAvgSeverity({})).toBe(0);
    });

    // 5. Calculate cycle duration using differenceInDays + 1
    test('should calculate cycle duration inclusive of both start and end days', () => {
        const calculateCycleDuration = (startDate, endDate) => {
            return differenceInDays(new Date(endDate), new Date(startDate)) + 1;
        };
        expect(calculateCycleDuration('2023-10-01', '2023-10-05')).toBe(5);
    });

    // 6. Slice MongoDB ID to last 8 characters and uppercase
    test('should format MongoDB ObjectId to last 8 uppercase characters', () => {
        const formatId = (id) => id.slice(-8).toUpperCase();
        const mongoId = "507f1f77bcf86cd799439011";
        expect(formatId(mongoId)).toBe("99439011");
    });

    // 7. Return last 7 items using .slice(-7)
    test('should return exactly the last 7 items from an array', () => {
        const getLastSevenItems = (arr) => arr.slice(-7);
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        expect(getLastSevenItems(data)).toEqual([4, 5, 6, 7, 8, 9, 10]);
        expect(getLastSevenItems([1, 2])).toEqual([1, 2]); // Should not fail for short arrays
    });

    // 8. Validate enum values (Low, Medium, High)
    test('should strictly validate predefined enum values', () => {
        const isValidEnum = (val) => ['Low', 'Medium', 'High'].includes(val);
        expect(isValidEnum('Low')).toBe(true);
        expect(isValidEnum('Medium')).toBe(true);
        expect(isValidEnum('High')).toBe(true);
        expect(isValidEnum('Severe')).toBe(false);
    });

    // 9. Validate time format "HH:MM"
    test('should validate 24-hour HH:MM time format', () => {
        const validateTimeFormat = (time) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
        expect(validateTimeFormat("14:30")).toBe(true);
        expect(validateTimeFormat("09:05")).toBe(true);
        expect(validateTimeFormat("24:00")).toBe(false);
        expect(validateTimeFormat("13:60")).toBe(false);
    });

    // 10. Calculate BMI from height and weight
    test('should calculate BMI accurately from weight (kg) and height (cm)', () => {
        const calculateBMI = (weightKg, heightCm) => {
            const heightM = heightCm / 100;
            return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
        };
        // Weight: 70kg, Height: 175cm => 70 / (1.75^2) = 22.857... => 22.9
        expect(calculateBMI(70, 175)).toBe(22.9); 
    });

    // 11. Store and validate array fields
    test('should validate that the field is precisely an array format', () => {
        const validateArrayField = (field) => Array.isArray(field);
        expect(validateArrayField(['Pain', 'Acne'])).toBe(true);
        expect(validateArrayField([])).toBe(true);
        expect(validateArrayField('Pain, Acne')).toBe(false);
    });

    // 12. Count object keys using Object.keys
    test('should successfully count total keys within an object payload', () => {
        const countKeys = (obj) => Object.keys(obj).length;
        const symptoms = { Pain: 2, Fatigue: 4, Acne: 1 };
        expect(countKeys(symptoms)).toBe(3);
        expect(countKeys({})).toBe(0);
    });

    // 13. Format ISO date to "MMM dd"
    test('should format standard ISO date string to "MMM dd" using date-fns', () => {
        const formatDate = (isoDate) => format(parseISO(isoDate), 'MMM dd');
        expect(formatDate('2023-11-05T14:48:00.000Z')).toBe('Nov 05');
    });

    // 14. Exclude password field from API response
    test('should successfully drop the password field from the user object response', () => {
        const sanitizeUser = (user) => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        };
        const rawUser = { id: 1, name: 'John Doe', email: 'j@example.com', password: 'hashedpassword' };
        expect(sanitizeUser(rawUser)).not.toHaveProperty('password');
        expect(sanitizeUser(rawUser)).toHaveProperty('email', 'j@example.com');
    });

    // 15. Assign default role "user"
    test('should assign default role "user" if no role is explicitly provided', () => {
        const createUser = (payload) => {
            return { role: 'user', ...payload };
        };
        expect(createUser({ name: 'Jane' })).toHaveProperty('role', 'user');
        expect(createUser({ name: 'Admin', role: 'admin' })).toHaveProperty('role', 'admin');
    });

    // 16. Sort data by date descending
    test('should correctly sort records descending based on a date key', () => {
        const sortByDateDesc = (arr) => {
            return arr.sort((a, b) => new Date(b.date) - new Date(a.date));
        };
        const logs = [
            { id: 1, date: '2023-10-01' },
            { id: 2, date: '2023-10-10' },
            { id: 3, date: '2023-10-05' }
        ];
        const sorted = sortByDateDesc([...logs]);
        expect(sorted[0].id).toBe(2); // Latest
        expect(sorted[2].id).toBe(1); // Oldest
    });

    // 17. Apply multiplier (1.3) in scoring logic
    test('should precisely scale the baseline score utilizing a 1.3 multiplier', () => {
        const applyMultiplier = (score) => score * 1.3;
        expect(applyMultiplier(10)).toBe(13);
        expect(applyMultiplier(0)).toBe(0);
    });

    // 18. Apply recency decay factor (0.3 for old data)
    test('should apply a recency decay factor reducing effective score natively to 30%', () => {
        const applyDecayFactor = (score, isOld) => isOld ? score * 0.3 : score;
        expect(applyDecayFactor(100, true)).toBe(30);
        expect(applyDecayFactor(100, false)).toBe(100);
    });

    // 19. Add BMI risk points when BMI >= 30
    test('should add bonus risk points securely if BMI crosses threshold >= 30', () => {
        const calculateBMIRisk = (baseScore, bmi) => bmi >= 30 ? baseScore + 15 : baseScore;
        expect(calculateBMIRisk(50, 31.5)).toBe(65);
        expect(calculateBMIRisk(50, 24.5)).toBe(50);
    });

    // 20. Apply persistence scoring for repeated symptoms
    test('should calculate robust persistence score checking repeated symptoms', () => {
        const applyPersistenceMultiplier = (occurrences) => {
            if (occurrences > 5) return 2.0;
            if (occurrences >= 3) return 1.5;
            return 1.0;
        };
        expect(applyPersistenceMultiplier(6)).toBe(2.0); // Highly persistent
        expect(applyPersistenceMultiplier(3)).toBe(1.5); // Moderately persistent
        expect(applyPersistenceMultiplier(1)).toBe(1.0); // No persistence score jump
    });

    // 21. Detect dominant category based on highest score
    test('should seamlessly pick the dominant category checking score maximums', () => {
        const pickDominantCategory = (categories) => {
            let maxKey = null;
            let maxVal = -1;
            for (const [key, val] of Object.entries(categories)) {
                if (val > maxVal) {
                    maxVal = val;
                    maxKey = key;
                }
            }
            return maxKey;
        };
        
        const categoryScores = { Hormonal: 45, Metabolic: 80, Inflammatory: 60 };
        expect(pickDominantCategory(categoryScores)).toBe('Metabolic');
    });

    // 22. Calculate consistency score (trackedDays / 14 * 100)
    test('should measure tracking consistency percentage gracefully over a 14 day period', () => {
        const calculateConsistency = (trackedDays) => {
            const cappedDays = Math.min(trackedDays, 14); 
            return parseFloat(((cappedDays / 14) * 100).toFixed(2));
        };
        expect(calculateConsistency(7)).toBe(50.00);
        expect(calculateConsistency(14)).toBe(100.00);
        expect(calculateConsistency(20)).toBe(100.00); // Caps out properly
        expect(calculateConsistency(0)).toBe(0.00);
    });

});
