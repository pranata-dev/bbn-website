import { PackageType, Role } from "@prisma/client"

export interface PackageFeatures {
    canAccessLatihan: boolean
    canAccessTryout: boolean
    tryoutLimit: number
    hasVideoExplanation: boolean
}

export function getPackageFeatures(packageType: PackageType | null | undefined, role?: Role | string): PackageFeatures {
    // Default features for users without a specific package (e.g., ADMIN or basic)
    const defaultFeatures: PackageFeatures = {
        canAccessLatihan: false,
        canAccessTryout: false,
        tryoutLimit: 0,
        hasVideoExplanation: false,
    }

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
                tryoutLimit: 1,
                hasVideoExplanation: false,
            }
        case "EINSTEIN":
            return {
                canAccessLatihan: true,
                canAccessTryout: true,
                tryoutLimit: 3,
                hasVideoExplanation: true,
            }
        default:
            return defaultFeatures
    }
}
