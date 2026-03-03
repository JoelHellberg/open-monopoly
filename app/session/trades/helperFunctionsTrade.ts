import { Ownable, Player } from "@/types/gameTypes";

export function getMaxSharedIncome(
    property: string,
    ownerId: string,
    ownPlayerId: string,
    receivingPlayerId: string,
    ownables: Record<string, Ownable>,
    offeringProperties: string[],
    receivingProperties: string[]
): number {
    const isBeingTransferredToMe = receivingProperties.includes(property);
    const isBeingTransferredToThem = offeringProperties.includes(property);

    if (ownerId === ownPlayerId) {
        if (isBeingTransferredToMe) return 100;
        return ownables?.[property]?.incomePercent?.[ownPlayerId] || 100;
    } else {
        if (isBeingTransferredToThem) return 100;
        return ownables?.[property]?.incomePercent?.[receivingPlayerId] || 100;
    }
}

export function getPostTradeProperties(
    currentOwnables: string[] | undefined,
    propertiesTradedAway: string[],
    propertiesReceived: string[]
): string[] {
    const myCurrent = currentOwnables || [];
    const kept = myCurrent.filter((p) => !propertiesTradedAway.includes(p));
    return [...kept, ...propertiesReceived];
}

export function toggleItemInList<T>(list: T[], item: T, isEqual: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
    const exists = list.some(i => isEqual(i, item));
    if (exists) {
        return list.filter(i => !isEqual(i, item));
    }
    return [...list, item];
}

export function updateSharedIncomeList(
    list: [string, number][],
    property: string,
    value: number
): [string, number][] {
    return list.map((item) => (item[0] === property ? [property, value] : item));
}

// Logic to clean up dependent lists (Rent/Income) when a property is added/removed from the main trade list
export function cleanDependentLists(
    property: string,
    isValidToKeep: boolean, // If false, remove from list
    currentFreeRent: string[],
    currentSharedIncome: [string, number][]
): { newFreeRent: string[]; newSharedIncome: [string, number][] } {
    if (isValidToKeep) return { newFreeRent: currentFreeRent, newSharedIncome: currentSharedIncome };

    return {
        newFreeRent: currentFreeRent.filter((p) => p !== property),
        newSharedIncome: currentSharedIncome.filter((p) => p[0] !== property),
    };
}
