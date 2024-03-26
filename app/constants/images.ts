import { ImageRequireSource } from "react-native"

const AVATARS = [
    require("../../assets/images/avatars/avatar_1.png"),
    require("../../assets/images/avatars/avatar_2.png"),
    require("../../assets/images/avatars/avatar_3.png"),
    require("../../assets/images/avatars/avatar_4.png"),
    require("../../assets/images/avatars/avatar_5.png"),
    require("../../assets/images/avatars/avatar_6.png"),
    require("../../assets/images/avatars/avatar_7.png"),
    require("../../assets/images/avatars/avatar_8.png"),
    require("../../assets/images/avatars/avatar_9.png"),
    require("../../assets/images/avatars/avatar_10.png"),
]

const LOADS = [
    require("../../assets/images/loads/whites.png"),
    require("../../assets/images/loads/darks.png"),
    require("../../assets/images/loads/colors.png"),
    require("../../assets/images/loads/delicates.png"),
    require("../../assets/images/loads/towels.png"),
    require("../../assets/images/loads/bedding.png"),
    require("../../assets/images/loads/other.png"),
]


const GROUPS = [
    require("../../assets/images/groups/group_1.png"),
    require("../../assets/images/groups/group_2.png"),
    require("../../assets/images/groups/group_3.png"),
    require("../../assets/images/groups/group_4.png"),
    require("../../assets/images/groups/group_5.png"),
    require("../../assets/images/groups/group_6.png"),
]

export function getGroupImage(groupIndex: number | undefined): ImageRequireSource {
    if (groupIndex === undefined) {
        return GROUPS[0]
    }
    return GROUPS[groupIndex - 1]
}

export function getLoadImage(loadType: string | undefined): ImageRequireSource {
    if (loadType === undefined) {
        return LOADS[0]
    }
    switch (loadType) {
        case "Whites":
            return LOADS[0]
        case "Darks":
            return LOADS[1]
        case "Colors":
            return LOADS[2]
        case "Delicates":
            return LOADS[3]
        case "Towels":
            return LOADS[4]
        case "Bedding":
            return LOADS[5]
        case "Other":
            return LOADS[6]
        default:
            return LOADS[0]
    }
}

export function getAvatarImage(index: number | undefined): ImageRequireSource {
    if (index === undefined) {
        return AVATARS[0]
    }
    return AVATARS[index - 1]
}