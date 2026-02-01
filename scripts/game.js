const CONFIG = {
    RARITIES: ["Common", "Uncommon", "Rare", "Very Rare", "Epic", "Heroic", "Legendary", "Mythical", "Ultimate"],
    DIFFICULTIES: ["Enjoy", "Casual", "Light", "Normal", "Hyper", "Extra", "Special", "Deluxe", "Hell", "Death"],
    TYPES: ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"],
    CHART: { /* ... (full 18-type chart needs to be copied here from your notes if not present) ... */ 
        Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
        Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
        Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
        Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
        Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
        Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
        Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
        Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
        Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
        Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
        Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
        Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
        Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
        Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
        Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
        Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
        Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
        Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 }
    },
    GEAR_GRID_SIZES: {
        "Common": { width: 3, height: 3 }, "Uncommon": { width: 3, height: 4 }, "Rare": { width: 4, height: 4 }, 
        "Very Rare": { width: 4, height: 5 }, "Epic": { width: 5, height: 5 }, "Heroic": { width: 5, height: 6 }, 
        "Legendary": { width: 6, height: 6 }, "Mythical": { width: 6, height: 7 }, "Ultimate": { width: 7, height: 7 }
    },
    MATERIAL_MAP: {
        Fire: 'Ruby', Ground: 'Ruby', Dragon: 'Ruby',
        Dark: 'Amethyst', Ghost: 'Amethyst', Poison: 'Amethyst',
        Electric: 'Topaz', Psychic: 'Topaz', Fairy: 'Topaz',
        Normal: 'Diamond', Ice: 'Diamond', Steel: 'Diamond',
        Grass: 'Emerald', Flying: 'Emerald', Bug: 'Emerald',
        Water: 'Sapphire', Fighting: 'Sapphire', Rock: 'Sapphire',
        Shadow: 'Onyx' // New mapping for future Shadow Type units
    },
    UPGRADE_COST_CLUSTERS: 1 
};

class Accessory {
    constructor(name, type, rarity = "Common", atkBonus = 20) {
        this.name = name; this.type = type; this.rarity = rarity; this.atkBonus = atkBonus;
    }
}

class Unit {
    constructor(name, type, stats) {
        this.name = name; this.type = type; this.rarity = "Common";
        this.baseHp = stats.hp; this.baseMp = stats.mp; this.baseAtk = stats.atk; 
        this.baseDef = stats.def; this.baseAgl = stats.agl;
        this.equippedGears = []; 
        this.en_passive = stats.en_passive; this.jp_passive = stats.jp_passive;
        this.statusEffects = [];
    }
    applyEffect(effectName, duration, amount = 0) {
        const existingEffect = this.statusEffects.find(e => e.name === effectName);
        if (existingEffect) {
            existingEffect.duration = duration;
            existingEffect.amount = amount;
        } else {
            this.statusEffects.push({ name: effectName, duration: duration, amount: amount });
        }
    }

    processEffects(turnType) {
        this.statusEffects = this.statusEffects.map(effect => {
            if (turnType === 'end') {
                effect.duration -= 1;
                // Add logic here for damage over time effects like Poison/Fire
            }
            return effect;
        }).filter(effect => effect.duration > 0);
    }

    getEffectiveStats() {
        let stats = {
            hp: this.baseHp, mp: this.baseMp, atk: this.baseAtk, def: this.baseDef, agl: this.baseAgl
        };
        
        let hasNullifier = false;
        let totalPenalties = { hp: 0, mp: 0, atk: 0, def: 0, agl: 0 };

        this.equippedGears.forEach(gear => {
            if (gear.id === "GEAR_NULLIFY_IX" || gear.id === "GEAR_NULLIFY_VIII") { hasNullifier = true; }
            for (const stat in gear.stats_plus) { if (stats.hasOwnProperty(stat)) { stats[stat] += gear.stats_plus[stat]; } }
            for (const stat in gear.stats_minus) { if (stats.hasOwnProperty(stat)) { totalPenalties[stat] += gear.stats_minus[stat]; } }
        });

        if (!hasNullifier) {
            for (const stat in totalPenalties) { if (stats.hasOwnProperty(stat)) { stats[stat] -= totalPenalties[stat]; } }
        }
        
        this.statusEffects.forEach(effect => {
            if (effect.name === 'ATK_Buff') stats.atk += effect.amount;
            if (effect.name === 'DEF_Buff') stats.def += effect.amount;
            if (effect.name === 'AGL_Debuff') stats.agl -= effect.amount;
            if (effect.name === 'Stun') stats.agl = 0;
        });
        
        return stats;
    }

    // NEW: Function to check if a unit is currently grounded
    isGrounded() {
        return this.statusEffects.some(e => e.name === 'Gravity');
    }

    // NEW: Function to calculate hit chance based on attack accuracy and caps
    calculateHitChance(attackAccuracy) {
        if (attackAccuracy === 100) return 100; // Guaranteed success

        let effectiveAccuracy = attackAccuracy;
        // In a real battle, you would factor in evasion buffs/debuffs here.
        // For now, assume base 95% is the standard (unless overridden by move JSON).

        // Enforce the general cap (98%)
        if (effectiveAccuracy > 98) effectiveAccuracy = 98;

        // Enforce the "game changer" cap (50%) if the base accuracy was 20%
        // We assume any move starting at 20% base accuracy is a "game changer"
        if (attackAccuracy === 20 && effectiveAccuracy > 50) effectiveAccuracy = 50;

        return effectiveAccuracy;
    }


    getDamageAgainst(target) {
        const effectiveStats = this.getEffectiveStats(); 
        let multiplier = 1.0;

        // CRITICAL CHANGE: Check for 'Grounded' effect before applying type chart
        let attackerType = this.type;
        let targetType = target.type;

        // Flying units hit by 'Gravity' lose their ground immunity
        if (targetType === 'Flying' && target.isGrounded()) {
            if (attackerType === 'Ground') {
                 // Remove immunity (0.0 multiplier becomes 1.0 or 2.0 depending on chart)
                 multiplier = CONFIG.CHART[attackerType][targetType] || 1.0; 
            }
        } else if (CONFIG.CHART[this.type] && CONFIG.CHART[this.type][target.type] !== undefined) {
            multiplier = CONFIG.CHART[this.type][target.type];
        }
        
        if (this.rarity === "Ultimate") { multiplier = 2.0; } 
        
        let equipmentAtk = effectiveStats.atk;
        return Math.floor(equipmentAtk * multiplier);
    }
}

class GameEngine {
    constructor() {
        this.team = []; this.credits = 0; this.diffIndex = 3; this.currentLanguage = 'en'; this.unlockedUnits = []; 
        this.playerGears = [
            { id: "GEAR_HP_01", name: "HP Module I", type: "Normal", width: 1, height: 1, stats_plus: { "hp": 100, "mp": 0, "atk": 0, "def": 0, "agl": 0 }, stats_minus: { "hp": 0, "mp": 0, "atk": 0, "def": 0, "agl": 0 } },
            { id: "GEAR_ATK_01", name: "ATK Module I", type: "Fighting", width: 1, height: 1, stats_plus: { "hp": 0, "mp": 0, "atk": 20, "def": 0, "agl": 0 }, stats_minus: { "hp": 0, "mp": 0, "atk": 0, "def": 0, "agl": 0 } },
            { id: "GEAR_DEF_01", name: "DEF Module I", type: "Steel", width: 1, height: 1, stats_plus: { "hp": 0, "mp": 0, "atk": 0, "def": 20, "agl": 0 }, stats_minus: { "hp": 0, "mp": 0, "atk": 0, "def": 0, "agl": 0 } },
            { id: "GEAR_HP_02_P_ATK", name: "HP Module II (Compact, -ATK)", type: "Normal", width: 1, height: 1, stats_plus: { "hp": 300, "mp": 0, "atk": 0, "def": 0, "agl": 0 }, stats_minus: { "hp": 0, "mp": 0, "atk": 10, "def": 0, "agl": 0 } }
        ];
        this.materials = {
            Ruby: 2, Amethyst: 0, Topaz: 0, Diamond: 2, Emerald: 0, Sapphire: 2, Onyx: 0
        };
    }
    
    toggleLanguage() { this.currentLanguage = (this.currentLanguage === 'en') ? 'jp' : 'en'; this.updateUI(); }
    unlockSecretUnit(unitID) {
        if (!this.unlockedUnits.includes(unitID)) {
            this.unlockedUnits.push(unitID); alert(`You defeated the Secret Unit! ${unitID} is now available for recruitment!`); this.updateUI(); 
        }
    }
    async recruitUnitFromFile(fileName) {
        try {
            const response = await fetch(`./units/${fileName}`); if (!response.ok) throw new Error('Network response was not ok');
            const unitData = await response.json();
            const SECRET_IDS = ["EXT-RM-001", "EXT-RM-002", "EXT-RM-003", "EXT-RM-004", "EXT-RM-005", "EXT-RM-006"];
            if (SECRET_IDS.includes(unitData.id) && !this.unlockedUnits.includes(unitData.id)) { alert("This is a Secret Unit! You must defeat them in a random encounter first!"); return; }
            if (this.team.length >= 5 && this.credits <= 0) { alert("6th unit or later requires Credits!"); return; }
            if (this.team.length >= 5) this.credits--; this.team.push(new Unit(unitData.name, unitData.type, unitData)); this.updateUI();
        } catch (error) { console.error("Failed to load unit from file:", error); alert("Could not load unit file. Make sure you are running on a local server!"); }
    }
     upgradeTeam() {
        this.team.forEach(u => {
            if (CONFIG.RARITIES.indexOf(u.rarity) >= CONFIG.RARITIES.length - 1) {
                alert(`${u.name} is already at max rarity (Ultimate)!`);
                return; // Skip if already max rarity
            }

            if (this.checkUpgradeCost(u.type, u.rarity)) {
                 const requiredMaterialType = CONFIG.MATERIAL_MAP[u.type];
                 this.materials[requiredMaterialType] -= CONFIG.UPGRADE_COST_CLUSTERS; // Consume material

                 // Apply stat upgrades to base stats
                 u.baseHp += 200; u.baseAtk += 50; u.baseDef += 30; u.baseAgl += 20; 
                 
                 // Increment rarity tier
                 let rIdx = CONFIG.RARITIES.indexOf(u.rarity);
                 u.rarity = CONFIG.RARITIES[rIdx + 1];
                 
                 alert(`Upgraded ${u.name} to ${u.rarity}! Consumed 1 ${requiredMaterialType} Cluster.`);
            }
        });
        this.updateUI();
    }
    openGearEquipUI(unitIndex) {
        const unit = this.team[unitIndex]; const gridSize = CONFIG.GEAR_GRID_SIZES[unit.rarity];
        if (!gridSize) { alert("This unit rarity does not have a defined gear grid size!"); return; }
        // NEW: Example of applying a debuff for testing the "Grounded" mechanic
        unit.applyEffect('Gravity', 3); 
        console.log("Applied 'Gravity' debuff for testing. Unit is now grounded.");
        this.updateUI(); 
        alert(`Check the console. Gear UI logic added to 'game.js'. 'Gravity' debuff applied for testing!`);
    }
    equipItem(idx) { this.openGearEquipUI(idx); }

    // Placeholder function to apply the shadow side effect to both user and enemy
    applyShadowSideEffect(userUnit, targetUnit) {
        console.log(`Applying shadow side effect to ${userUnit.name} (user) and ${targetUnit.name} (target). Logic not yet implemented.`);
    }
    
    // Function to handle the specific HP halving side effect of Shadow Boost
    handleHpHalvingSideEffect(userUnit) {
        const damage = Math.floor(userUnit.baseHp / 2);
        userUnit.baseHp -= damage;
        console.log(`${userUnit.name} used Shadow Boost and lost ${damage} HP!`);
        userUnit.applyEffect('ATK_Buff', 3, 100);
        userUnit.applyEffect('DEF_Buff', 3, 100); 
    }
    updateUI() {
        const field = document.getElementById('battlefield'); field.innerHTML = '';
        this.team.forEach((u, index) => {
            const isUlt = u.rarity === "Ultimate"; const card = document.createElement('div'); card.className = `card ${isUlt ? 'rarity-ultimate' : ''}`; card.style.backgroundColor = isUlt ? '' : `var(--${u.type})`;
            const passiveText = (this.currentLanguage === 'jp') ? u.jp_passive : u.en_passive; const effectiveStats = u.getEffectiveStats();
            const effectsList = u.statusEffects.map(e => `${e.name} (${e.duration} turns left)`).join(', ');
            card.innerHTML = `
                <strong>${(this.currentLanguage === 'jp') ? u.jp_name : u.name}</strong><br><small>${u.rarity} | ${u.type}</small>
                <div class="stat-bar"> HP: ${effectiveStats.hp} | ATK: ${effectiveStats.atk}<br> DEF: ${effectiveStats.def} | AGL: ${effectiveStats.agl}<br>
                    <i>Passive: ${passiveText || 'N/A'}</i> ${effectsList ? `<br><i>Effects: ${effectsList}</i>` : ''} </div>
                <button onclick="game.openGearEquipUI(${index})" style="font-size:10px; margin-top:5px;">Equip Gear</button>
            `;
            field.appendChild(card);
        });
        document.getElementById('credit-count').innerText = this.credits; document.getElementById('difficulty-text').innerText = CONFIG.DIFFICULTIES[this.diffIndex];
        const secretUnits = {'EXT-RM-001': 'btn-hunter', 'EXT-RM-002': 'btn-shinobi', 'EXT-RM-003': 'btn-strength-shinobi','EXT-RM-004': 'btn-speedy-shinobi', 'EXT-RM-005': 'btn-technical-shinobi', 'EXT-RM-006': 'btn-heavy-shinobi'};
        for (const unitId in secretUnits) {
            const buttonId = secretUnits[unitId]; const button = document.getElementById(buttonId);
            if (button) {
                if (this.unlockedUnits.includes(unitId)) { button.disabled = false; button.style.backgroundColor = 'green'; button.innerText = button.innerText.replace(' (Locked)', '').replace(' (Locked)', ''); } 
                else { button.disabled = true; button.style.backgroundColor = 'red'; if (!button.innerText.includes('(Locked)')) { button.innerText += ' (Locked)'; } }
            }
        }
    }
}

const game = new GameEngine();
function testUnlockHunter() { game.unlockSecretUnit("EXT-RM-001"); }
function testUnlockShinobi() { game.unlockSecretUnit("EXT-RM-002"); }
function testUnlockStrengthShinobi() { game.unlockSecretUnit("EXT-RM-003"); }
function testUnlockSpeedyShinobi() { game.unlockSecretUnit("EXT-RM-004"); }
function testUnlockTechnicalShinobi() { game.unlockSecretUnit("EXT-RM-005"); }
function testUnlockHeavyShinobi() { game.unlockSecretUnit("EXT-RM-006"); }
function changeDifficulty() { game.diffIndex = (game.diffIndex + 1) % CONFIG.DIFFICULTIES.length; game.updateUI(); }
function saveGame() { const data = JSON.stringify(game); const blob = new Blob([data], {type: "application/json"}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "Ultimate_Battle_2026.json"; a.click(); }
function startJackpotArenaTournament() { const currentDifficulty = CONFIG.DIFFICULTIES[game.diffIndex]; alert(`Jackpot Arena (Difficulty: ${currentDifficulty}) Initiated! Get ready for the 1v1 knockout tournament!`); console.log("Tournament started. Logic for elimination and jackpot reward needs implementation."); }
function checkJackpotReward() { const currentJackpotMaterials = Math.floor(Math.random() * 5000) + 1000; console.log(`Congratulations! You won ${currentJackpotMaterials} materials!`); game.credits += 10; game.updateUI(); }
