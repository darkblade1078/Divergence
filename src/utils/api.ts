import pnwkit from 'pnwkit-2.0';

export default class API {

    constructor() {
        pnwkit.setKeys(`${process.env.PNW_API_KEY}`);
    }

    async getNationInfo(nationId: number) {
        const nation = await pnwkit.nationQuery({ id: [nationId], first: 1 },
            `
            id
            nation_name
            discord
            last_active
            `
        );

        if(nation.length === 0)
            return null;
        
        return nation[0];
    }
}