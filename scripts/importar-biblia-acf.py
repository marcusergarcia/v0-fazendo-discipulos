import os
import sys
import requests
import time
from supabase import create_client, Client

try:
    import requests
    from supabase import create_client, Client
except ImportError as e:
    print("❌ Erro: Dependências não instaladas!")
    print("\nPara instalar as dependências necessárias, execute:")
    print("\n  pip install supabase requests")
    print("\nOu se você usa Python 3:")
    print("\n  pip3 install supabase requests")
    sys.exit(1)

# Configuração do Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Erro: Variáveis de ambiente não configuradas!")
    print("\nConfigure as seguintes variáveis de ambiente:")
    print("  SUPABASE_URL")
    print("  SUPABASE_SERVICE_ROLE_KEY")
    sys.exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

# Mapeamento de nomes para abreviações da API
LIVROS_MAP = {
    "Gênesis": "gn", "Êxodo": "ex", "Levítico": "lv", "Números": "nm", "Deuteronômio": "dt",
    "Josué": "js", "Juízes": "jz", "Rute": "rt", "1 Samuel": "1sm", "2 Samuel": "2sm",
    "1 Reis": "1rs", "2 Reis": "2rs", "1 Crônicas": "1cr", "2 Crônicas": "2cr",
    "Esdras": "ed", "Neemias": "ne", "Ester": "et", "Jó": "job", "Salmos": "sl",
    "Provérbios": "pv", "Eclesiastes": "ec", "Cânticos": "ct", "Isaías": "is",
    "Jeremias": "jr", "Lamentações": "lm", "Ezequiel": "ez", "Daniel": "dn",
    "Oséias": "os", "Joel": "jl", "Amós": "am", "Obadias": "ob", "Jonas": "jn",
    "Miquéias": "mq", "Naum": "na", "Habacuque": "hc", "Sofonias": "sf", "Ageu": "ag",
    "Zacarias": "zc", "Malaquias": "ml",
    "Mateus": "mt", "Marcos": "mc", "Lucas": "lc", "João": "jo", "Atos": "at",
    "Romanos": "rm", "1 Coríntios": "1co", "2 Coríntios": "2co", "Gálatas": "gl",
    "Efésios": "ef", "Filipenses": "fp", "Colossenses": "cl", "1 Tessalonicenses": "1ts",
    "2 Tessalonicenses": "2ts", "1 Timóteo": "1tm", "2 Timóteo": "2tm", "Tito": "tt",
    "Filemom": "fm", "Hebreus": "hb", "Tiago": "tg", "1 Pedro": "1pe", "2 Pedro": "2pe",
    "1 João": "1jo", "2 João": "2jo", "3 João": "3jo", "Judas": "jd", "Apocalipse": "ap"
}

def buscar_livros():
    """Busca todos os livros do banco de dados"""
    response = supabase.table("livros_biblia").select("*").order("ordem").execute()
    return response.data

def buscar_capitulo_api(abreviacao: str, numero_capitulo: int, versao: str = "acf"):
    """Busca o texto de um capítulo da API ABíbliaDigital"""
    url = f"https://www.abibliadigital.com.br/api/verses/{versao}/{abreviacao}/{numero_capitulo}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Concatenar todos os versículos em um único texto
            verses = data.get("verses", [])
            texto_completo = " ".join([v.get("text", "") for v in verses])
            return texto_completo
        else:
            print(f"❌ Erro ao buscar {abreviacao} {numero_capitulo}: Status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Erro ao buscar {abreviacao} {numero_capitulo}: {e}")
        return None

def atualizar_capitulo(livro_id: int, numero_capitulo: int, texto: str):
    """Atualiza o texto de um capítulo no banco"""
    try:
        supabase.table("capitulos_biblia").update({
            "texto": texto
        }).eq("livro_id", livro_id).eq("numero_capitulo", numero_capitulo).execute()
        return True
    except Exception as e:
        print(f"❌ Erro ao salvar capítulo: {e}")
        return False

def importar_biblia():
    """Importa toda a Bíblia ACF"""
    print("🚀 Iniciando importação da Bíblia ACF...")
    
    livros = buscar_livros()
    total_livros = len(livros)
    total_capitulos = 0
    sucesso = 0
    falhas = 0
    
    for idx, livro in enumerate(livros, 1):
        nome = livro["nome"]
        livro_id = livro["id"]
        total_caps = livro["total_capitulos"]
        abreviacao = LIVROS_MAP.get(nome)
        
        if not abreviacao:
            print(f"⚠️  [{idx}/{total_livros}] {nome}: Abreviação não encontrada, pulando...")
            continue
        
        print(f"\n📖 [{idx}/{total_livros}] Importando {nome} ({total_caps} capítulos)...")
        
        for cap in range(1, total_caps + 1):
            total_capitulos += 1
            print(f"   Capítulo {cap}/{total_caps}...", end=" ")
            
            # Buscar texto da API
            texto = buscar_capitulo_api(abreviacao, cap)
            
            if texto:
                # Salvar no banco
                if atualizar_capitulo(livro_id, cap, texto):
                    sucesso += 1
                    print("✅")
                else:
                    falhas += 1
                    print("❌ Erro ao salvar")
            else:
                falhas += 1
                print("❌ Erro ao buscar")
            
            # Aguardar para não sobrecarregar a API
            time.sleep(0.5)
    
    print("\n" + "="*50)
    print(f"✅ Importação concluída!")
    print(f"📊 Total de capítulos processados: {total_capitulos}")
    print(f"✅ Sucessos: {sucesso}")
    print(f"❌ Falhas: {falhas}")
    print("="*50)

if __name__ == "__main__":
    importar_biblia()
