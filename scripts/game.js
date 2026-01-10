const CONFIG = {
    RARITIES: ["Common", "Uncommon", "Rare", "Very Rare", "Epic", "Heroic", "Legendary", "Mythical", "Ultimate"],
    DIFFICULTIES: ["Enjoy", "Casual", "Light", "Normal", "Hyper", "Extra", "Special", "Deluxe", "Hell", "Death"],
    TYPES: ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"],
    CHART: { /* ... (full 18-type chart from previous response) ... */ 
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
    }
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
    }

    getEffectiveStats() {
        let stats = {
            hp: this.baseHp, mp: this.baseMp, atk: this.baseAtk, def: this.baseDef, agl: this.baseAgl
        };
        
        let hasNullifier = false;
        let totalPenalties = { hp: 0, mp: 0, atk: 0, def: 0, agl: 0 };

        this.equippedGears.forEach(gear => {
            // Check for Tier VIII or IX nullifier ID
            if (gear.id === "GEAR_NULLIFY_IX" || gear.id === "GEAR_NULLIFY_VIII") {
                hasNullifier = true; 
            }
            for (const stat in gear.stats_plus) {
                if (stats.hasOwnProperty(stat)) {
                    stats[stat] += gear.stats_plus[stat];
                }
            }
            for (const stat in gear.stats_minus) {
                if (stats.hasOwnProperty(stat)) {
                    totalPenalties[stat] += gear.stats_minus[stat];
                }
            }
        });

        if (!hasNullifier) {
            for (const stat in totalPenalties) {
                if (stats.hasOwnProperty(stat)) {
                    stats[stat] -= totalPenalties[stat];
                }
            }
        }
        
        return stats;
    }

    getDamageAgainst(target) {
        // Use effective ATK in combat calculation
        const effectiveStats = this.getEffectiveStats(); 
        let multiplier = 1.0;
        
        if (this.rarity === "Ultimate") {
            multiplier = 2.0;
        } else if (CONFIG.CHART[this.type] && CONFIG.CHART[this.type][target.type] !== undefined) {
            multiplier = CONFIG.CHART[this.type][target.type];
        }

        // Accessories logic might need adjustment later to combine with new gear system
        let equipmentAtk = effectiveStats.atk;
        // this.slots.forEach(acc => { ... }); 

        return Math.floor(equipmentAtk * multiplier);
    }
}

class GameEngine {
    constructor() {
        this.team = [];
        this.credits = 0;
        this.diffIndex = 3;
        this.currentLanguage = 'en';
        this.unlockedUnits = []; 
    }
    
    toggleLanguage() { this.currentLanguage = (this.currentLanguage === 'en') ? 'jp' : 'en'; this.updateUI(); }
    unlockSecretUnit(unitID) {
        if (!this.unlockedUnits.includes(unitID)) {
            this.unlockedUnits.push(unitID);
            alert(`You defeated the Secret Unit! ${unitID} is now available for recruitment!`);
            this.updateUI(); 
        }
    }
    async recruitUnitFromFile(fileName) {
        try {
            const response = await fetch(`./units/${fileName}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const unitData = await response.json();
            const SECRET_IDS = ["EXT-RM-001", "EXT-RM-002", "EXT-RM-003", "EXT-RM-004", "EXT-RM-005", "EXT-RM-006"];
            if (SECRET_IDS.includes(unitData.id) && !this.unlockedUnits.includes(unitData.id)) {
                 alert("This is a Secret Unit! You must defeat them in a random encounter first!");
                 return;
            }
            if (this.team.length >= 5 && this.credits <= 0) {
                alert("6th unit or later requires Credits!");
                return;
            }
            if (this.team.length >= 5) this.credits--;
            this.team.push(new Unit(unitData.name, unitData.type, unitData)); 
            this.updateUI();
        } catch (error) {
            console.error("Failed to load unit from file:", error);
            alert("Could not load unit file. Make sure you are running on a local server!");
        }
    }
    upgradeTeam() {
        this.team.forEach(u => {
            // Note: Upgrades should likely apply to base stats, not effective stats.
            u.baseHp += 200; u.baseAtk += 50; u.baseDef += 30; u.baseAgl += 20; 
            let rIdx = CONFIG.RARITIES.indexOf(u.rarity);
            if (rIdx < CONFIG.RARITIES.length - 1) {
                u.rarity = CONFIG.RARITIES[rIdx + 1];
                // u.maxSlots = Math.min(8, rIdx + 2); // Accessory logic needs review
            }
        });
        this.updateUI();
    }
    equipItem(idx) {
        alert("Gear system UI not yet implemented. Cannot equip items this way yet!");
        // const unit = this.team[idx];
        // if(unit.slots.length < unit.maxSlots) { ... }
    }
    updateUI() {
        const field = document.getElementById('battlefield');
        field.innerHTML = '';
        this.team.forEach((u, index) => {
            const isUlt = u.rarity === "Ultimate";
            const card = document.createElement('div');
            card.className = `card ${isUlt ? 'rarity-ultimate' : ''}`;
            card.style.backgroundColor = isUlt ? '' : `var(--${u.type})`;
            const passiveText = (this.currentLanguage === 'jp') ? u.jp_passive : u.en_passive;
            
            const effectiveStats = u.getEffectiveStats(); // Get current stats
            
            card.innerHTML = `
                <strong>${(this.currentLanguage === 'jp') ? u.jp_name : u.name}</strong><br>
                <small>${u.rarity} | ${u.type}</small>
                <div class="stat-bar">
                    HP: ${effectiveStats.hp} | ATK: ${effectiveStats.atk}<br>
                    DEF: ${effectiveStats.def} | AGL: ${effectiveStats.agl}<br>
                    <i>Passive: ${passiveText || 'N/A'}</i>
                </div>
                <!-- Gear/Accessory UI needs implementation here -->
                <button onclick="game.equipItem(${index})" style="font-size:10px; margin-top:5px;">Equip Gear</button>
            `;
            field.appendChild(card);
        });
        document.getElementById('credit-count').innerText = this.credits;
        document.getElementById('difficulty-text').innerText = CONFIG.DIFFICULTIES[this.diffIndex];
        const secretUnits = {'EXT-RM-001': 'btn-hunter', 'EXT-RM-002': 'btn-shinobi', 'EXT-RM-003': 'btn-strength-shinobi','EXT-RM-004': 'btn-speedy-shinobi', 'EXT-RM-005': 'btn-technical-shinobi', 'EXT-RM-006': 'btn-heavy-shinobi'};
        for (const unitId in secretUnits) {
            const buttonId = secretUnits[unitId];
            const button = document.getElementById(buttonId);
            if (button) {
                if (this.unlockedUnits.includes(unitId)) {
                    button.disabled = false; button.style.backgroundColor = 'green';
                    button.innerText = button.innerText.replace(' (Locked)', '').replace(' (Locked)', '');
                } else {
                    button.disabled = true; button.style.backgroundColor = 'red';
                    if (!button.innerText.includes('(Locked)')) { button.innerText += ' (Locked)'; }
                }
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
function changeDifficulty() {
    game.diffIndex = (game.diffIndex + 1) % CONFIG.DIFFICULTIES.length;
    game.updateUI();
}
function saveGame() {
    const data = JSON.stringify(game);
    const blob = new Blob([data], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "Ultimate_Battle_2026.json"; a.click();
}
