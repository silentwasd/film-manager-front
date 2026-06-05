import {PersonRole} from "~/types/enums/PersonRole";

export default function (role: PersonRole) {
    switch (role) {
        case PersonRole.Director:
            return 'Режиссёр';
        case PersonRole.Actor:
            return 'Актёр';
        case PersonRole.VoiceActor:
            return 'Актёр озвучки';
        case PersonRole.Producer:
            return 'Продюсер';
        case PersonRole.Screenwriter:
            return 'Сценарист';
        case PersonRole.Operator:
            return 'Оператор';
        case PersonRole.Artist:
            return 'Художник';
        case PersonRole.Editor:
            return 'Монтажёр';
        case PersonRole.Composer:
            return 'Композитор';
        case PersonRole.SoundDirector:
            return 'Звукорежиссёр';
        case PersonRole.DubbingDirector:
            return 'Режиссёр дубляжа';
        case PersonRole.DubbingActor:
            return 'Актёр дубляжа';
        case PersonRole.Translator:
            return 'Переводчик';
    }
}