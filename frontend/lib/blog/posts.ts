export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  image: string;
  paragraphs: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "patricia-criadora-momentos-em-flor",
    title: "Patrícia, a pessoa por detrás da Momentos em Flor",
    excerpt: "Uma marca feita de sensibilidade, cuidado e da vontade de transformar flores em gestos com significado.",
    category: "A nossa história",
    readingTime: "3 min",
    image: process.env.NEXT_PUBLIC_BLOG_PATRICIA_IMAGE || "/hero.png",
    paragraphs: [
      "A Momentos em Flor nasceu da visão da Patrícia: tornar mais simples oferecer um gesto bonito, pessoal e preparado com verdadeira atenção ao detalhe.",
      "Na origem da marca está uma ideia muito humana — há sentimentos que nem sempre cabem em palavras, mas que podem chegar através de uma composição escolhida com intenção.",
      "Cada encomenda é tratada como parte de uma história real. É essa proximidade, entre a escolha de quem oferece e a emoção de quem recebe, que continua a orientar a Momentos em Flor.",
    ],
  },
  {
    slug: "como-escolher-flores-para-cada-ocasiao",
    title: "Como escolher flores para cada ocasião",
    excerpt: "Cor, estilo e intenção: um guia simples para encontrar uma composição que diga exatamente o que sentes.",
    category: "Inspiração",
    readingTime: "4 min",
    image: process.env.NEXT_PUBLIC_BLOG_OCCASIONS_IMAGE || "/hero.png",
    paragraphs: [
      "Começa pela emoção que queres transmitir. Tons suaves tendem a comunicar delicadeza; cores intensas criam um gesto mais expressivo e celebratório.",
      "Pensa também na pessoa que vai receber. Uma composição contemporânea pode combinar com alguém que aprecia linhas simples, enquanto um ramo mais orgânico transmite espontaneidade e movimento.",
      "Não existe uma escolha universalmente certa. A melhor é aquela que junta a ocasião, a personalidade de quem recebe e uma mensagem escrita com sinceridade.",
    ],
  },
  {
    slug: "como-cuidar-de-um-ramo-de-flores",
    title: "Pequenos cuidados para as flores durarem mais",
    excerpt: "Gestos simples que ajudam a preservar a frescura e a beleza do ramo durante mais tempo.",
    category: "Cuidados",
    readingTime: "3 min",
    image: process.env.NEXT_PUBLIC_BLOG_FLOWER_CARE_IMAGE || "/hero.png",
    paragraphs: [
      "Coloca as flores numa jarra limpa, com água fresca, e remove as folhas que ficariam submersas. Isto ajuda a manter a água em melhores condições.",
      "Corta ligeiramente as hastes na diagonal antes de as colocar na jarra e volta a renovar o corte quando mudares a água.",
      "Mantém o ramo afastado de sol direto, fontes de calor e fruta madura. Como cada variedade tem o seu ritmo natural, retira as flores que terminarem primeiro para proteger as restantes.",
    ],
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);
