import { Photo } from './photo';

export interface User {  // matches userforlistdto, and optional for userfordetaildto with more properties
    id: number;
    userName: string;
    age: number;
    gender: string;
    created: Date;
    lastActive: Date;
    photoUrl: string;
    city: string;
    country: string;
    interests?: string;
    introduction?: string;
    lookingFor?: string;
    photos?: Photo[];
    roles?: string[];
}
