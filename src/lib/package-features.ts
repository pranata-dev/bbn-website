import { PackageType, Role } from "@prisma/client"

export interface PackageFeatures {
    canAccessLatihan: boolean
    canAccessTryout: boolean
    tryoutLimit: number
    hasVideoExplanation: boolean
}

export function getPackageFeatures(packageType: PackageType | null | undefined, role?: Role | string, subject?: string | null): PackageFeatures {
    // Default features for users without a specific package (e.g., ADMIN or basic)
    const defaultFeatures: PackageFeatures = {
        canAccessLatihan: false,
        canAccessTryout: false,
        tryoutLimit: 0,
        hasVideoExplanation: false,
    }

    // Fallback logic for legacy accounts that have a Role but no PackageType yet
    let activePackage = packageType
    
    if (role === "ADMIN") {
        return {
            canAccessLatihan: true,
            canAccessTryout: true,
            tryoutLimit: 100, // Unlimited for admins
            hasVideoExplanation: true,
        }
    }

    if (!activePackage && role) {
        switch (role) {
            case "UTS_EINSTEIN":
                activePackage = "EINSTEIN"
                break
            case "UTS_SENKU":
                activePackage = "SENKU"
                break
            case "UTS_FLUX":
                activePackage = "FLUX"
                break
            case "STUDENT_PREMIUM":
                activePackage = "REGULER"
                break
        }
    }

    if (!activePackage) return defaultFeatures

    switch (activePackage) {
        case "REGULER":
            return {
                canAccessLatihan: false, // Explicitly no defined benefits for regular yet as per spec
                canAccessTryout: false,
                tryoutLimit: 0,
                hasVideoExplanation: false,
            }
        case "FLUX":
            return {
                canAccessLatihan: true,
                canAccessTryout: false,
                tryoutLimit: 0,
                hasVideoExplanation: false,
            }
        case "SENKU":
            return {
                canAccessLatihan: true,
                canAccessTryout: true,
                tryoutLimit: subject === "FISMAT" ? 3 : 1,
                hasVideoExplanation: false,
            }
        case "EINSTEIN":
            return {
                canAccessLatihan: true,
                canAccessTryout: true,
                tryoutLimit: subject === "FISMAT" ? 10 : 3,
                hasVideoExplanation: true,
            }
        default:
            return defaultFeatures
    }
}

export function parsePracticePartFromTitle(title: string | null | undefined): number | null {
    if (!title) return null
    const match = title.match(/Part\s+(\d+)/i)
    return match ? parseInt(match[1], 10) : null
}

export function canAccessPracticePart(
    packageType: PackageType | null | undefined,
    role: string | undefined,
    partNumber: number | null | undefined,
    title?: string | null,
    subject?: string | null,
    totalPartsInCategory?: number | null
): boolean {
    if (role === "ADMIN") return true
    
    // Fallback logic for legacy accounts that have a Role but no PackageType yet
    let activePackage = packageType
    
    if (!activePackage && role) {
        switch (role) {
            case "UTS_EINSTEIN":
                activePackage = "EINSTEIN"
                break
            case "UTS_SENKU":
                activePackage = "SENKU"
                break
            case "UTS_FLUX":
                activePackage = "FLUX"
                break
            case "STUDENT_PREMIUM":
                activePackage = "REGULER"
                break
        }
    }

    // Resolve part number: use DB value, or parse from title as fallback
    const resolvedPart = partNumber ?? parsePracticePartFromTitle(title)

    if (!activePackage || !resolvedPart) return false

    // FISMAT: Dynamic percentage-based access
    if (subject === "FISMAT" && totalPartsInCategory && totalPartsInCategory > 0) {
        switch (activePackage) {
            case "FLUX":
                return resolvedPart <= Math.ceil(totalPartsInCategory * 0.25)
            case "SENKU":
                return resolvedPart <= Math.ceil(totalPartsInCategory * 0.50)
            case "EINSTEIN":
                return true
            default:
                return false
        }
    }

    // FISDAS2 (and fallback): Fixed part limits
    switch (activePackage) {
        case "FLUX":
            return resolvedPart <= 1
        case "SENKU":
            return resolvedPart <= 2
        case "EINSTEIN":
            return true
        default:
            return false
    }
}

