type Education = {}

type Contact = {
    logo: string
    profile_url: string
}

type Project = {}

export type CVInformation = {
    /**
     * @description description about myself
     */
    About: string
    /**
     * @description general skills and knowledge
     */
    'Skills & Knowledge': string[]
    Projects: Project[]
    Education: Education[]
    /**
     * @description where you can find and contact me
     */
    Contacts: Contact[]
}
