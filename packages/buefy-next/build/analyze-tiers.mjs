import * as fs from 'node:fs'

const isSilent = true

// Loads the data.

const statsPath = './tiers/stats.json'
const outputPath = './tiers/tiers.json'
const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'))
const { nodeMetas } = stats

// Groups node meta data

function regexGroupExtractor(re) {
    return (path) => re.exec(path)?.[1]
}

function regexGroupCoersion(re, groupId) {
    return (path) => re.test(path) ? groupId : undefined
}

const GROUP_ID_EXTRACTORS = [
    // earlier match precedes
    regexGroupExtractor(/^(\/src\/components\/[^/]+)/),
    regexGroupExtractor(/^(\/src\/directives\/[^/]+)/),
    regexGroupCoersion(/^\/src\/utils\/Tabbed[^/]+/, '/src/utils/Tabbed'),
    regexGroupCoersion(/^\/src\/utils\/(Provide|Inject)[^/]+/, '/src/utils/ProvideInject'),
    regexGroupExtractor(/^(\/src\/utils\/[^/]+)/),
    regexGroupExtractor(/^(\/src\/[^/]+)$/)
]

function extractGroupId(path) {
    return GROUP_ID_EXTRACTORS
        .map((extractor) => extractor(path))
        .find((groupId) => groupId != null)
}

function assignGroupIdsToNodeMetas() {
    for (const uid in nodeMetas) {
        const nodeMeta = nodeMetas[uid]
        nodeMeta.groupId = extractGroupId(nodeMeta.id)
        if (!isSilent) {
            console.log('group', nodeMeta.groupId, nodeMeta.id)
        }
    }
}

// Assigns naive tier IDs to node meta data

function calculateTierIdOfUid(uid) {
    const nodeMeta = nodeMetas[uid]
    if (nodeMeta == null) {
        throw new RangeError(`unknown UID: ${uid}`)
    }
    if ('tierId' in nodeMeta) {
        return nodeMeta.tierId
    }
    let tierId
    if (nodeMeta.imported.length === 0) {
        tierId = 0
    } else {
        // TODO: what if circular dependency?
        tierId = Math.max(...nodeMeta.imported.map((link) => calculateTierIdOfUid(link.uid))) + 1
    }
    // caches the tier ID so that we won't calculate it again
    nodeMeta.tierId = tierId
    return tierId
}

function assignTierIdsToNodeMetas() {
    for (const uid in nodeMetas) {
        const path = nodeMetas[uid].id
        try {
            const tierId = calculateTierIdOfUid(uid)
            if (!isSilent) {
                console.log(`tier[${tierId}]:`, path)
            }
        } catch (err) {
            console.error('Failed to calculate tier ID. Data may be corrupted.', 'path:', path)
            throw err
        }
    }
}

// Assigns group tier IDs

function calculateGroupTierId(groupId) {
    const group = Object.keys(nodeMetas)
        .map((uid) => nodeMetas[uid])
        .filter((nodeMeta) => nodeMeta.groupId === groupId)
    if (group.length === 0) {
        throw new RangeError(`unknown group ID: ${groupId}`)
    }
    return Math.max(...group.map((nodeMeta) => nodeMeta.tierId))
}

function assignGroupTierIdsToNodeMetas() {
    const tierIdByGroupId = {}
    for (const uid in nodeMetas) {
        const nodeMeta = nodeMetas[uid]
        const groupId = nodeMeta.groupId
        if (groupId == null) {
            console.warn('Ignore node not in any group:', nodeMeta.id)
            continue
        }
        let groupTierId
        if (groupId in tierIdByGroupId) {
            groupTierId = tierIdByGroupId[groupId]
        } else {
            groupTierId = calculateGroupTierId(groupId)
            if (isNaN(groupTierId)) {
                throw new Error(`group contains corrupted node: ${groupId}`)
            }
            tierIdByGroupId[groupId] = groupTierId
        }
        nodeMeta.groupTierId = groupTierId
    }
}

function collectGroupedTiers() {
    const tiers = {}
    for (const uid in nodeMetas) {
        const nodeMeta = nodeMetas[uid]
        const groupTierId = nodeMeta.groupTierId
        if (groupTierId == null) {
            continue
        }
        if (tiers[groupTierId] == null) {
            tiers[groupTierId] = {}
        }
        const tier = tiers[groupTierId]
        if (tier[nodeMeta.groupId] == null) {
            tier[nodeMeta.groupId] = []
        }
        tier[nodeMeta.groupId].push(nodeMeta.id)
    }
    return tiers
}

function normalizeTiers(tiers) {
    const tierIds = Object.keys(tiers).map(Number)
    tierIds.sort((a, b) => a - b)
    const newTiers = {}
    tierIds.forEach((tierId, index) => {
        newTiers[index] = tiers[tierId]
    })
    return newTiers
}

// Actually processes data

assignGroupIdsToNodeMetas()
assignTierIdsToNodeMetas()
assignGroupTierIdsToNodeMetas()

const tiers = normalizeTiers(collectGroupedTiers())
if (!isSilent) {
    for (const [tierId, tier] of Object.entries(tiers)) {
        console.log(`tier-${tierId}:`, tier)
    }
}
fs.writeFileSync(outputPath, JSON.stringify(tiers, null, 2))
