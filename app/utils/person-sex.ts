import {PersonSex} from "~/types/enums/PersonSex";

export default function (sex: PersonSex) {
    switch (sex) {
        case PersonSex.Male:
            return 'Мужской';
        case PersonSex.Female:
            return 'Женский';
    }
}